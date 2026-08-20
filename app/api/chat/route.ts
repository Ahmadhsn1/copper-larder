import { NextRequest } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { getServerSupabase } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/prompt";
import { matchIntercept, matchComplaint, COMPLAINT_RESPONSE } from "@/lib/intercepts";
import { getRequestIp, hashIp, hashQuestion } from "@/lib/hash";
import { upsertCache, computeShowCallbackCard } from "@/lib/cache";
import { isSessionCapped, checkAndConsumeUsageCaps } from "@/lib/rate-limit";
import { detectDietaryLock } from "@/lib/dietary";
import { BOOKING_ACTIONS, detectDishCard } from "@/lib/quickActions";
import type { ChatMessage } from "@/lib/database.types";

export const runtime = "nodejs";

const bodySchema = z.object({
  sessionId: z.string().min(1).max(200),
  message: z.string().min(1).max(500),
  history: z
    .array(z.object({ role: z.enum(["user", "model"]), content: z.string().max(2000) }))
    .max(100)
    .optional()
    .default([]),
});

const FALLBACK_MESSAGE =
  "Sorry — I'm a bit snowed under just now. Give the team a ring on 0121 496 0180, or leave your number and they'll call you back.";
const CAP_MESSAGE =
  "We've covered a lot of ground! For anything else, give the team a ring on 0121 496 0180 — they'll sort you right out.";

const AVAILABILITY_CONFIRM_REGEX =
  /you'?re (all set|booked|confirmed)|table('s| is) booked|yes,? (it'?s|that'?s) available|i'?ve booked/i;
const ALLERGY_REGEX = /allerg|coeliac|celiac|gluten|\bnuts?\b/i;
const ALLERGY_DISCLAIMER =
  " Do double check with the kitchen when you ring — they'll talk you through it properly.";

function sseEncode(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    const json = await req.json();
    parsed = bodySchema.parse(json);
  } catch {
    return new Response(sseEncode("error", { message: "Invalid request." }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const { sessionId, message, history } = parsed;
  const supabase = getServerSupabase();
  const ip = getRequestIp(req.headers);
  const ipHash = hashIp(ip);
  const userAgent = req.headers.get("user-agent") ?? null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(sseEncode(event, data)));

      try {
        const { data: existing } = await supabase
          .from("conversations")
          .select("message_count, messages")
          .eq("session_id", sessionId)
          .maybeSingle();

        let messageCount = existing?.message_count ?? 0;
        let messages: ChatMessage[] = existing?.messages ?? [];

        if (!existing) {
          await supabase.from("conversations").insert({
            session_id: sessionId,
            ip_hash: ipHash,
            user_agent: userAgent,
          });
        }

        const persistTurn = async (assistantText: string, flag?: "complaint") => {
          const now = new Date().toISOString();
          messages = [
            ...messages,
            { role: "user", content: message, ts: now },
            { role: "model", content: assistantText, ts: now },
          ];
          messageCount += 1;
          await supabase
            .from("conversations")
            .update({
              messages,
              message_count: messageCount,
              updated_at: now,
              ...(flag ? { flag } : {}),
            })
            .eq("session_id", sessionId);
        };

        // 1. session cap — always checked first, regardless of path
        if (isSessionCapped(messageCount)) {
          await persistTurn(CAP_MESSAGE);
          send("chunk", { text: CAP_MESSAGE });
          send("done", { fullText: CAP_MESSAGE, showCallbackCard: true, cached: false, quickActions: BOOKING_ACTIONS });
          controller.close();
          return;
        }

        // 1.5 handoff detection — a complaint should never get a cheerful
        // menu recommendation, so this runs before the normal intercepts
        if (matchComplaint(message)) {
          await persistTurn(COMPLAINT_RESPONSE, "complaint");
          send("chunk", { text: COMPLAINT_RESPONSE });
          send("done", {
            fullText: COMPLAINT_RESPONSE,
            showCallbackCard: true,
            cached: false,
            quickActions: BOOKING_ACTIONS,
          });
          controller.close();
          return;
        }

        // 2. deterministic intercepts — free, checked before anything paid
        const intercept = matchIntercept(message);
        if (intercept) {
          await persistTurn(intercept.text);
          await upsertCache(supabase, message, intercept.text, "intercept");
          send("chunk", { text: intercept.text });
          send("done", {
            fullText: intercept.text,
            showCallbackCard: intercept.action === "show_callback_card",
            cached: false,
            quickActions: intercept.quickActions,
            card: intercept.card,
          });
          controller.close();
          return;
        }

        // 3. exact-match cache — only early in the conversation, before any
        // dietary lock or accumulated context could make a stale answer wrong
        const cacheEligible = messageCount <= 1;
        if (cacheEligible) {
          const questionHash = hashQuestion(message);
          const { data: cacheHit } = await supabase
            .from("cache")
            .select("id, answer, hits")
            .eq("question_hash", questionHash)
            .maybeSingle();

          if (cacheHit) {
            await supabase
              .from("cache")
              .update({ hits: cacheHit.hits + 1, last_hit_at: new Date().toISOString() })
              .eq("id", cacheHit.id);
            await persistTurn(cacheHit.answer);
            send("chunk", { text: cacheHit.answer });
            const cacheShowCallback = computeShowCallbackCard(cacheHit.answer);
            send("done", {
              fullText: cacheHit.answer,
              showCallbackCard: cacheShowCallback,
              cached: true,
              quickActions: cacheShowCallback ? BOOKING_ACTIONS : undefined,
              card: detectDishCard(cacheHit.answer) ?? undefined,
            });
            controller.close();
            return;
          }
        }

        // 4. rate caps — only the paid (Gemini-bound) path consumes this budget
        const usage = await checkAndConsumeUsageCaps(supabase, ipHash);
        if (!usage.ok) {
          await persistTurn(FALLBACK_MESSAGE);
          send("chunk", { text: FALLBACK_MESSAGE });
          send("done", {
            fullText: FALLBACK_MESSAGE,
            showCallbackCard: true,
            cached: false,
            quickActions: BOOKING_ACTIONS,
          });
          controller.close();
          return;
        }

        // 5. Gemini, streamed
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
        const ai = new GoogleGenAI({ apiKey });

        const recentHistory = history.slice(-6);
        const contents = [
          ...recentHistory.map((h) => ({
            role: h.role,
            parts: [{ text: h.content }],
          })),
          { role: "user" as const, parts: [{ text: message }] },
        ];

        // Dietary lock (spec §6) — scan the *full* transcript the client has
        // sent us, not just the last-6 window used for the Gemini call, so a
        // "vegan"/"gluten free" mention early in a long conversation still
        // holds once that message ages out of the model's context.
        const dietaryLock = detectDietaryLock([...history.map((h) => h.content), message]);

        const result = await ai.models.generateContentStream({
          model: "gemini-2.0-flash",
          contents,
          config: {
            systemInstruction: buildSystemPrompt(dietaryLock),
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        });

        let fullText = "";
        for await (const chunk of result) {
          const text = chunk.text ?? "";
          if (text) {
            fullText += text;
            send("chunk", { text });
          }
        }

        let hadAvailabilityViolation = false;

        if (!fullText.trim()) {
          fullText = FALLBACK_MESSAGE;
        } else {
          if (ALLERGY_REGEX.test(message) && !ALLERGY_REGEX.test(fullText)) {
            fullText += ALLERGY_DISCLAIMER;
            send("chunk", { text: ALLERGY_DISCLAIMER });
          }

          // Hard guardrail: never confirm availability. Detection alone isn't
          // enforcement — actively correct the reply the same way the allergy
          // disclaimer does, rather than just logging the violation.
          hadAvailabilityViolation = AVAILABILITY_CONFIRM_REGEX.test(fullText);
          if (hadAvailabilityViolation) {
            console.warn("[guardrail] availability confirmation caught and corrected:", fullText);
            const correction =
              " Just to be clear — I can't confirm bookings here. Ring the team on 0121 496 0180 to lock in a table.";
            fullText += correction;
            send("chunk", { text: correction });
          }
        }

        await persistTurn(fullText);
        // Never cache a response that tripped the availability guardrail —
        // an exact-match cache entry is served verbatim to every future
        // visitor, so a bad answer here would be a persistent, site-wide
        // problem rather than a one-off.
        if (cacheEligible && !hadAvailabilityViolation) {
          await upsertCache(supabase, message, fullText, "llm");
        }

        const showCallbackCard = computeShowCallbackCard(fullText);
        send("done", {
          fullText,
          showCallbackCard,
          cached: false,
          quickActions: showCallbackCard ? BOOKING_ACTIONS : undefined,
          card: detectDishCard(fullText) ?? undefined,
        });
        controller.close();
      } catch (err) {
        console.error("[api/chat] error", err);
        send("chunk", { text: FALLBACK_MESSAGE });
        send("done", {
          fullText: FALLBACK_MESSAGE,
          showCallbackCard: true,
          cached: false,
          quickActions: BOOKING_ACTIONS,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
