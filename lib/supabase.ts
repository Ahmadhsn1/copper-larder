import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Service-role client — bypasses RLS. Server-only: every table has RLS
 * enabled with no policies, so this is the only client that can read/write
 * conversations, leads, cache, or rate_limit_counters. Never import this
 * from a "use client" file.
 */
export function getServerSupabase() {
  if (typeof window !== "undefined") {
    throw new Error("getServerSupabase() must never be called from the browser.");
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Anon-key client for any future browser-side use (e.g. opt-in Realtime).
 * Not used by the default build — all data access goes through Route
 * Handlers / Server Components using getServerSupabase().
 */
export function getBrowserSupabase() {
  return createClient<Database>(supabaseUrl, anonKey);
}
