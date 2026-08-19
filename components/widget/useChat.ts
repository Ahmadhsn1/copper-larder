"use client";

// Owns chat session/message state for the widget: session identity, the
// message list, and the hand-rolled SSE client that talks to /api/chat.
// CallbackCard.tsx posts to /api/lead on its own — this hook does not know
// about lead capture beyond surfacing `showCallbackCard` on a message.

import { useCallback, useRef, useState } from "react";
import { RESTAURANT } from "@/lib/restaurant";

export type ChatRole = "user" | "model";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  showCallbackCard?: boolean;
  cached?: boolean;
};

export type UseChatResult = {
  sessionId: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  isTyping: boolean;
  send: (text: string) => void;
};

const SESSION_STORAGE_KEY = "cl_session_id";
const MIN_TYPING_DELAY_MS = 400;
const NETWORK_FALLBACK_TEXT = `Sorry — I'm having trouble connecting just now. Give the team a ring on ${RESTAURANT.phone}, or try again in a moment.`;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Extremely defensive fallback; every supported browser has randomUUID.
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const created = createId();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

type ChunkData = { text: string };
type DoneData = { fullText: string; showCallbackCard: boolean; cached: boolean };
type ErrorData = { message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseChunkData(value: unknown): ChunkData | null {
  if (!isRecord(value) || typeof value.text !== "string") return null;
  return { text: value.text };
}

function parseDoneData(value: unknown): DoneData | null {
  if (
    !isRecord(value) ||
    typeof value.fullText !== "string" ||
    typeof value.showCallbackCard !== "boolean" ||
    typeof value.cached !== "boolean"
  ) {
    return null;
  }
  return { fullText: value.fullText, showCallbackCard: value.showCallbackCard, cached: value.cached };
}

function parseErrorData(value: unknown): ErrorData | null {
  if (!isRecord(value) || typeof value.message !== "string") return null;
  return { message: value.message };
}

/** One parsed "event: X\ndata: {...}" frame from the SSE stream. */
type SseFrame = { event: string; data: unknown };

/**
 * Consumes newly-arrived text, splits it into complete SSE frames on the
 * blank-line separator, and returns the parsed frames plus whatever partial
 * text should be carried over into the next chunk.
 */
function extractFrames(buffer: string): { frames: SseFrame[]; rest: string } {
  const frames: SseFrame[] = [];
  let rest = buffer;
  let sepIndex = rest.indexOf("\n\n");
  while (sepIndex !== -1) {
    const raw = rest.slice(0, sepIndex);
    rest = rest.slice(sepIndex + 2);
    if (raw.trim().length > 0) {
      let eventName = "message";
      let dataText = "";
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) {
          eventName = line.slice("event:".length).trim();
        } else if (line.startsWith("data:")) {
          dataText += line.slice("data:".length).trim();
        }
      }
      if (dataText) {
        try {
          frames.push({ event: eventName, data: JSON.parse(dataText) as unknown });
        } catch {
          // Malformed frame — skip it rather than crash the stream reader.
        }
      }
    }
    sepIndex = rest.indexOf("\n\n");
  }
  return { frames, rest };
}

export function useChat(): UseChatResult {
  const [sessionId] = useState<string>(() => readOrCreateSessionId());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Always-current mirror of `messages`, so send() can read the latest
  // history without needing to recreate its identity on every message.
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  const streamingRef = useRef(false);

  const send = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text || streamingRef.current) return;

      streamingRef.current = true;
      const priorMessages = messagesRef.current;
      const userMessage: ChatMessage = { id: createId(), role: "user", content: text };
      const assistantId = createId();

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setIsTyping(true);

      // --- gating state for the "first token" UX beat ---
      let timerFired = false;
      let gateOpened = false;
      let firstContentArrived = false;
      let bufferedText = "";
      let doneData: DoneData | null = null;
      let errorData: ErrorData | null = null;

      const finish = () => {
        streamingRef.current = false;
        setIsStreaming(false);
        setIsTyping(false);
      };

      const sync = () => {
        if (!gateOpened) {
          if (!timerFired) return;
          if (!firstContentArrived && !doneData && !errorData) return;
          gateOpened = true;
          setMessages((prev) => [...prev, { id: assistantId, role: "model", content: bufferedText }]);
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: bufferedText } : m)),
          );
        }

        if (doneData) {
          const final = doneData;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: final.fullText, showCallbackCard: final.showCallbackCard, cached: final.cached }
                : m,
            ),
          );
          finish();
        } else if (errorData) {
          finish();
        }
      };

      window.setTimeout(() => {
        timerFired = true;
        sync();
      }, MIN_TYPING_DELAY_MS);

      const history = priorMessages.map((m) => ({ role: m.role, content: m.content }));

      (async () => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, message: text, history }),
          });

          if (!response.body) {
            errorData = { message: NETWORK_FALLBACK_TEXT };
            bufferedText = bufferedText || NETWORK_FALLBACK_TEXT;
            sync();
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          for (;;) {
            const { done, value } = await reader.read();
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              const { frames, rest } = extractFrames(buffer);
              buffer = rest;
              for (const frame of frames) {
                if (frame.event === "chunk") {
                  const chunk = parseChunkData(frame.data);
                  if (chunk) {
                    bufferedText += chunk.text;
                    firstContentArrived = true;
                    sync();
                  }
                } else if (frame.event === "done") {
                  const parsedDone = parseDoneData(frame.data);
                  if (parsedDone) {
                    doneData = parsedDone;
                    bufferedText = parsedDone.fullText;
                    sync();
                  }
                } else if (frame.event === "error") {
                  const parsedError = parseErrorData(frame.data);
                  if (parsedError) {
                    errorData = parsedError;
                    bufferedText = bufferedText || parsedError.message;
                    sync();
                  }
                }
              }
            }
            if (done) break;
          }

          // Stream ended without an explicit "done"/"error" frame (should not
          // happen given the server contract, but keep the UI from hanging).
          if (!doneData && !errorData) {
            errorData = { message: NETWORK_FALLBACK_TEXT };
            bufferedText = bufferedText || NETWORK_FALLBACK_TEXT;
            sync();
          }
        } catch {
          errorData = { message: NETWORK_FALLBACK_TEXT };
          bufferedText = bufferedText || NETWORK_FALLBACK_TEXT;
          sync();
        }
      })();
    },
    [sessionId],
  );

  return { sessionId, messages, isStreaming, isTyping, send };
}
