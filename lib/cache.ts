import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { hashQuestion } from "./hash";

/**
 * Upserts a question/answer pair into the exact-match cache. Also powers the
 * dashboard's "top questions" view (question_text + source + hits), so this
 * is the single write path for both intercepted and LLM-answered turns.
 */
export async function upsertCache(
  supabase: SupabaseClient<Database>,
  questionText: string,
  answer: string,
  source: "llm" | "intercept"
): Promise<void> {
  const question_hash = hashQuestion(questionText);
  const { data: existing } = await supabase
    .from("cache")
    .select("id, hits")
    .eq("question_hash", question_hash)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cache")
      .update({ hits: existing.hits + 1, last_hit_at: new Date().toISOString() })
      .eq("id", existing.id);
    return;
  }

  const { error } = await supabase.from("cache").insert({
    question_hash,
    question_text: questionText,
    answer,
    source,
  });

  // A concurrent request may have inserted the same question_hash between our
  // read and this write (unique constraint violation) — fall back to the
  // update path instead of silently dropping the hit.
  if (error) {
    const { data: raceWinner } = await supabase
      .from("cache")
      .select("id, hits")
      .eq("question_hash", question_hash)
      .maybeSingle();
    if (raceWinner) {
      await supabase
        .from("cache")
        .update({ hits: raceWinner.hits + 1, last_hit_at: new Date().toISOString() })
        .eq("id", raceWinner.id);
    }
  }
}

const BOOKING_KEYWORDS = /\bring\b|\bcall the team\b|give.*a call|\bbook(ing)?\b|\b0121\b|\bphone\b/i;
const PHONE_REGEX = /\b012\d[ -]?\d{3}[ -]?\d{4}\b/;

export function computeShowCallbackCard(text: string): boolean {
  return PHONE_REGEX.test(text) || BOOKING_KEYWORDS.test(text);
}
