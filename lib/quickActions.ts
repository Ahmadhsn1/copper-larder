import { MENU, type DietTag, type MenuSection } from "./restaurant";

// Shared contract between the backend (intercepts.ts, api/chat/route.ts) and
// the widget UI (QuickActions.tsx, DishCard.tsx, InfoCard.tsx). Every value
// here is either a literal label/copy string or pulled straight from
// lib/restaurant.ts — nothing is model-generated, so there is no
// hallucination surface in the contextual-suggestion system.

export type QuickAction =
  | { kind: "send"; label: string; value: string }
  | { kind: "tel"; label: string }
  | { kind: "directions"; label: string };

export type RichCard =
  | { type: "dish"; name: string; description: string; price: string; tags?: DietTag[] }
  | { type: "info"; title: string; lines: string[] };

export const OPENING_QUICK_ACTIONS: QuickAction[] = [
  { kind: "send", label: "Explore the Menu", value: "Show me the menu" },
  { kind: "send", label: "Find a Dish", value: "What should I order?" },
  { kind: "send", label: "Sunday Roast", value: "Tell me about Sunday roast" },
  { kind: "send", label: "Plan a Visit", value: "Where are you and what are your hours?" },
];

export const MENU_CATEGORY_ACTIONS: QuickAction[] = MENU.map((section) => ({
  kind: "send",
  label: section.title,
  value: `Show me the ${section.title.toLowerCase()}`,
}));

export const VISIT_ACTIONS: QuickAction[] = [
  { kind: "directions", label: "Get Directions" },
  { kind: "tel", label: "Call the Restaurant" },
  { kind: "send", label: "Book a Table", value: "I'd like to book a table" },
];

export const SUNDAY_ROAST_ACTIONS: QuickAction[] = [
  { kind: "send", label: "Book Sunday Roast", value: "I'd like to book a table for Sunday roast" },
  { kind: "send", label: "View Menu", value: "Show me the menu" },
  { kind: "send", label: "Visit Us", value: "Where are you and what are your hours?" },
];

export const BOOKING_ACTIONS: QuickAction[] = [{ kind: "tel", label: "Call the Restaurant" }];

export const MENU_INTRO_ACTIONS: QuickAction[] = MENU_CATEGORY_ACTIONS;

function categoryActionsExcluding(sectionId: string): QuickAction[] {
  return MENU.filter((section) => section.id !== sectionId).map((section) => ({
    kind: "send",
    label: section.title,
    value: `Show me the ${section.title.toLowerCase()}`,
  }));
}

/** Formats one MENU section as the deterministic reply text for its category quick action. */
export function formatMenuSection(section: MenuSection): string {
  const lines = section.items.map((item) => {
    const desc = item.description ? `, ${item.description}` : "";
    return `${item.name}${desc} — ${item.price}`;
  });
  const note = section.note ? ` (${section.note})` : "";
  return `${section.title}${note}\n${lines.join("\n")}`;
}

/** Quick actions to show under a category listing: the other categories, so browsing stays fluid. */
export function categoryFollowUpActions(sectionId: string): QuickAction[] {
  return categoryActionsExcluding(sectionId);
}

type Preference = "rich" | "light" | "vegetarian" | "classic" | "surprise";

const PREFERENCE_LABELS: Record<Preference, string> = {
  rich: "Something Rich",
  light: "Something Light",
  vegetarian: "Vegetarian",
  classic: "Something Classic",
  surprise: "Surprise Me",
};

export const PREFERENCE_QUICK_ACTIONS: QuickAction[] = (
  ["rich", "light", "vegetarian", "classic", "surprise"] as Preference[]
).map((p) => ({ kind: "send", label: PREFERENCE_LABELS[p], value: PREFERENCE_LABELS[p] }));

const MAINS = MENU.find((s) => s.id === "mains")!.items;
const STARTERS = MENU.find((s) => s.id === "starters")!.items;

function findItem(name: string) {
  const item = [...MAINS, ...STARTERS].find((i) => i.name === name);
  if (!item) throw new Error(`quickActions: menu item "${name}" not found`);
  return item;
}

const RECOMMENDATION: Record<
  Preference,
  { text: string; dish: (typeof MAINS)[number] }
> = {
  rich: {
    text: "If you're after something rich and slow-cooked, the feather blade's the one — it's braised for six hours in red wine until it falls apart.",
    dish: findItem("Braised Feather Blade of Beef"),
  },
  light: {
    text: "For something lighter, I'd steer you towards the pan-fried hake — brown shrimp butter, nothing heavy about it.",
    dish: findItem("Pan-Fried Hake"),
  },
  vegetarian: {
    text: "The heritage beetroot & barley risotto is the one to have — proper, not an afterthought. Mushroom toast to start if you fancy.",
    dish: findItem("Heritage Beetroot & Barley Risotto"),
  },
  classic: {
    text: "Can't go wrong with the roast chicken supreme — leek and tarragon, straightforward and done properly.",
    dish: findItem("Roast Chicken Supreme"),
  },
  surprise: {
    text: "Let me surprise you, then — the braised feather blade. Six hours in red wine, it's the dish people come back for.",
    dish: findItem("Braised Feather Blade of Beef"),
  },
};

/** Matches a preference quick-action label exactly (case-insensitive) and returns its canned recommendation. */
export function matchPreference(message: string): { text: string; card: RichCard; actions: QuickAction[] } | null {
  const normalized = message.trim().toLowerCase();
  const preference = (Object.keys(PREFERENCE_LABELS) as Preference[]).find(
    (p) => PREFERENCE_LABELS[p].toLowerCase() === normalized,
  );
  if (!preference) return null;
  const rec = RECOMMENDATION[preference];
  return {
    text: rec.text,
    card: { type: "dish", name: rec.dish.name, description: rec.dish.description, price: rec.dish.price, tags: rec.dish.tags },
    actions: [
      { kind: "send", label: "View Menu", value: "Show me the menu" },
      { kind: "send", label: "Show All Mains", value: "Show me the mains" },
    ],
  };
}

/** Flattened {name -> item} lookup used to detect which single dish an LLM reply is actually about. */
const ALL_ITEMS = MENU.flatMap((section) => section.items);

/**
 * If exactly one MENU item name appears in `text`, returns it as a dish card.
 * Pure substring match against real data — the model can only "trigger" a
 * card by actually naming a real dish, never by inventing one.
 */
export function detectDishCard(text: string): RichCard | null {
  const lower = text.toLowerCase();
  const matches = ALL_ITEMS.filter((item) => lower.includes(item.name.toLowerCase()));
  if (matches.length !== 1) return null;
  const item = matches[0];
  return { type: "dish", name: item.name, description: item.description, price: item.price, tags: item.tags };
}
