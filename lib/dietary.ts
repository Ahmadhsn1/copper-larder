export type DietaryLock = "vegan" | "vegetarian" | "gluten-free" | null;

const VEGAN_PATTERN = /\bvegan\b/i;
const VEGETARIAN_PATTERN = /\bvegetarian\b|\bveggie\b/i;
const GLUTEN_FREE_PATTERN = /gluten.?free|\bcoeliac\b|\bceliac\b/i;

/**
 * Scans the *entire* conversation transcript (not just the last-6 window
 * sent to Gemini) for a dietary signal, so a lock established early in a
 * long conversation still holds once the raw message history gets truncated
 * for the model call. Vegan takes priority over vegetarian if both appear.
 */
export function detectDietaryLock(texts: string[]): DietaryLock {
  const joined = texts.join(" \n ");
  if (VEGAN_PATTERN.test(joined)) return "vegan";
  if (GLUTEN_FREE_PATTERN.test(joined)) return "gluten-free";
  if (VEGETARIAN_PATTERN.test(joined)) return "vegetarian";
  return null;
}
