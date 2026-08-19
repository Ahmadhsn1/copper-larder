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

  await supabase.from("cache").insert({
    question_hash,
    question_text: questionText,
    answer,
    source,
  });
}

const BOOKING_KEYWORDS = /ring|call the team|give.*a call|book(ing)?|0121|phone/i;
const PHONE_REGEX = /\b012\d[ -]?\d{3}[ -]?\d{4}\b/;

export function computeShowCallbackCard(text: string): boolean {
  return PHONE_REGEX.test(text) || BOOKING_KEYWORDS.test(text);
}
