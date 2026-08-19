import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const bodySchema = z.object({
  sessionId: z.string().min(1).max(200).optional(),
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  preferredTime: z.string().min(1).max(120),
});

const DOUBLE_SUBMIT_WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = getServerSupabase();
  const { sessionId, name, phone, preferredTime } = parsed;

  if (sessionId) {
    const { data: recent } = await supabase
      .from("leads")
      .select("id, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent && Date.now() - new Date(recent.created_at).getTime() < DOUBLE_SUBMIT_WINDOW_MS) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const { error } = await supabase.from("leads").insert({
    session_id: sessionId ?? null,
    name,
    phone,
    preferred_time: preferredTime,
  });

  if (error) {
    console.error("[api/lead] insert error", error);
    return NextResponse.json({ error: "Could not save lead." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
