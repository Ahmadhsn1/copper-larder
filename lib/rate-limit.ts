import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export const SESSION_MESSAGE_CAP = 20;
export const IP_DAILY_CAP = 40;
export const GLOBAL_DAILY_CAP = 200;

/** Session cap is read straight off conversations.message_count — no extra row needed. */
export function isSessionCapped(messageCount: number): boolean {
  return messageCount >= SESSION_MESSAGE_CAP;
}

/**
 * Atomically increments the ip/day and global/day counters via the
 * increment_rate_limit RPC and reports whether either breached its cap.
 * Only call this on the paid path (cache-miss → Gemini) — intercepted and
 * cache-hit turns are free and must not consume this budget.
 */
export async function checkAndConsumeUsageCaps(
  supabase: SupabaseClient<Database>,
  ipHash: string
): Promise<{ ok: boolean; reason?: "ip" | "global" }> {
  const { data: ipCount, error: ipError } = await supabase.rpc("increment_rate_limit", {
    p_scope: "ip",
    p_scope_key: ipHash,
  });
  if (ipError) throw ipError;
  if ((ipCount ?? 0) > IP_DAILY_CAP) return { ok: false, reason: "ip" };

  const { data: globalCount, error: globalError } = await supabase.rpc("increment_rate_limit", {
    p_scope: "global",
    p_scope_key: "global",
  });
  if (globalError) throw globalError;
  if ((globalCount ?? 0) > GLOBAL_DAILY_CAP) return { ok: false, reason: "global" };

  return { ok: true };
}
