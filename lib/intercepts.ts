import { MENU, RESTAURANT, SUNDAY_ROAST, HOURS_TEXT, getOpenStatus } from "./restaurant";
import {
  BOOKING_ACTIONS,
  MENU_INTRO_ACTIONS,
  PREFERENCE_QUICK_ACTIONS,
  SUNDAY_ROAST_ACTIONS,
  VISIT_ACTIONS,
  categoryFollowUpActions,
  formatMenuSection,
  matchPreference,
  type QuickAction,
  type RichCard,
} from "./quickActions";

export type InterceptResult = {
  text: string;
  action?: "show_callback_card";
  source: "intercept";
  id: string;
  quickActions?: QuickAction[];
  card?: RichCard;
};

type Rule = {
  id: string;
  patterns: RegExp[];
  respond: () => InterceptResult;
};

function normalize(message: string): string {
  return message.toLowerCase().trim().replace(/[!?.]+$/g, "");
}

// Ordered, deterministic, zero-API. First match wins. Canned strings match
// the spec's objection-handling table (§4) and instant-info feature (§8 #4)
// word-for-word so intercepted and LLM-generated replies never diverge in voice.
const RULES: Rule[] = [
  {
    id: "hours",
    patterns: [/\bopen\b/, /\bhours?\b/, /what time/, /when.*close/, /when.*open/],
    respond: () => {
      const status = getOpenStatus();
      const statusLine =
        status === "closed"
          ? "We're closed right now, but here are our hours:"
          : "We're open now — here are our full hours:";
      return {
        source: "intercept",
        id: "hours",
        text: `${statusLine} ${HOURS_TEXT}.`,
        quickActions: VISIT_ACTIONS,
      };
    },
  },
  {
    id: "address",
    patterns: [/\baddress\b/, /\bwhere.*(you|located|find)/, /\bdirections?\b/, /\bpostcode\b/],
    respond: () => ({
      source: "intercept",
      id: "address",
      text: `We're at ${RESTAURANT.address}. ${RESTAURANT.parking}`,
      card: { type: "info", title: "Visit", lines: [RESTAURANT.address] },
      quickActions: VISIT_ACTIONS,
    }),
  },
  {
    id: "parking",
    patterns: [/\bpark(ing)?\b/],
    respond: () => ({
      source: "intercept",
      id: "parking",
      text: RESTAURANT.parking,
      quickActions: VISIT_ACTIONS,
    }),
  },
  {
    id: "dog_friendly",
    patterns: [/\bdog(s)?\b/, /\bpet(s)?\b/],
    respond: () => ({
      source: "intercept",
      id: "dog_friendly",
      text: "Bar area yes, dining room no. Water bowls out front.",
    }),
  },
  {
    id: "sunday_roast",
    patterns: [/sunday roast/, /\broast\b.*sunday/],
    respond: () => ({
      source: "intercept",
      id: "sunday_roast",
      text: `Sunday roast is ${SUNDAY_ROAST.price}, served ${SUNDAY_ROAST.hours} — ${SUNDAY_ROAST.note}.`,
      quickActions: SUNDAY_ROAST_ACTIONS,
    }),
  },
  {
    id: "kids",
    patterns: [/\bkids?\b/, /\bchildren\b/, /\bfamily friendly\b/],
    respond: () => ({
      source: "intercept",
      id: "kids",
      text: "Very — we do smaller portions on request. Early evening's calmer if you'd rather miss the rush.",
    }),
  },
  {
    id: "vegetarian",
    patterns: [/\bvegetarian\b/, /\bveggie\b/],
    respond: () => ({
      source: "intercept",
      id: "vegetarian",
      text: "Plenty. Beetroot & barley risotto is the standout — properly good, not an afterthought. Mushroom toast to start.",
      card: { type: "dish", name: "Heritage Beetroot & Barley Risotto", description: "", price: "£16", tags: ["vg"] },
      quickActions: [{ kind: "send", label: "View Menu", value: "Show me the menu" }],
    }),
  },
  {
    id: "recommend_prompt",
    patterns: [
      /what should i (order|eat|get|have)/,
      /\brecommend/,
      /\bsuggest/,
      /what'?s good/,
      /what do you (recommend|suggest)/,
    ],
    respond: () => ({
      source: "intercept",
      id: "recommend_prompt",
      text: "What are you in the mood for?",
      quickActions: PREFERENCE_QUICK_ACTIONS,
    }),
  },
  {
    id: "starters",
    patterns: [/\bstarters?\b/],
    respond: () => ({
      source: "intercept",
      id: "starters",
      text: formatMenuSection(MENU.find((s) => s.id === "starters")!),
      quickActions: categoryFollowUpActions("starters"),
    }),
  },
  {
    id: "mains",
    patterns: [/\bmains?\b/],
    respond: () => ({
      source: "intercept",
      id: "mains",
      text: formatMenuSection(MENU.find((s) => s.id === "mains")!),
      quickActions: categoryFollowUpActions("mains"),
    }),
  },
  {
    id: "sides",
    patterns: [/\bsides?\b/],
    respond: () => ({
      source: "intercept",
      id: "sides",
      text: formatMenuSection(MENU.find((s) => s.id === "sides")!),
      quickActions: categoryFollowUpActions("sides"),
    }),
  },
  {
    id: "desserts",
    patterns: [/\bdesserts?\b/, /\bpudding(s)?\b/],
    respond: () => ({
      source: "intercept",
      id: "desserts",
      text: formatMenuSection(MENU.find((s) => s.id === "desserts")!),
      quickActions: categoryFollowUpActions("desserts"),
    }),
  },
  {
    id: "menu",
    patterns: [/\bmenu\b/, /what.*(you have|on offer)/, /what.*food/],
    respond: () => ({
      source: "intercept",
      id: "menu",
      text: "Here's what we've got — starters through pudding, plus the Sunday roast on Sundays. Where would you like to start?",
      quickActions: MENU_INTRO_ACTIONS,
    }),
  },
  {
    id: "allergies",
    patterns: [/\ballerg(y|ies|ic)\b/, /\bcoeliac\b/, /\bceliac\b/, /gluten.?free/, /\bnuts?\b/],
    respond: () => ({
      source: "intercept",
      id: "allergies",
      text: "We can adapt most dishes. Do mention it when you ring — the kitchen will talk you through it properly.",
    }),
  },
  {
    id: "pricey",
    patterns: [/\bpricey\b/, /\bexpensive\b/, /\btoo much\b/, /\bcheap(er)?\b/],
    respond: () => ({
      source: "intercept",
      id: "pricey",
      text: "Mains sit £16–24, but portions are generous — most skip a starter. Two of you with a side, you're around £45.",
    }),
  },
  {
    id: "browsing",
    patterns: [/just (browsing|looking)/, /^browsing$/],
    respond: () => ({
      source: "intercept",
      id: "browsing",
      text: "No rush 👍 Worth knowing Thursdays are our quietest — easiest night to walk in.",
    }),
  },
  {
    id: "big_group",
    patterns: [/big group/, /large group/, /\bparty of\b/, /\b(8|9|10|\d{2,})\s*(of us|people)\b/],
    respond: () => ({
      source: "intercept",
      id: "big_group",
      text: `Anything over 8, ring ahead — they'll sort a table. ${RESTAURANT.phone}.`,
    }),
  },
  {
    id: "booking",
    patterns: [/\bbook(ing)?\b/, /\breserv(e|ation)\b/, /\btable\b.*\b(for|tonight|tomorrow)\b/, /can i (get|have|book)/],
    respond: () => ({
      source: "intercept",
      id: "booking",
      text: `Bookings are by phone — give the team a ring on ${RESTAURANT.phone}. Or leave your number and they'll call you back.`,
      action: "show_callback_card",
      quickActions: BOOKING_ACTIONS,
    }),
  },
  {
    id: "phone",
    patterns: [/\bphone number\b/, /\bcall you\b/, /\byour number\b/, /\bcontact\b/],
    respond: () => ({
      source: "intercept",
      id: "phone",
      text: `You can reach us on ${RESTAURANT.phone}.`,
      action: "show_callback_card",
      quickActions: BOOKING_ACTIONS,
    }),
  },
];

/** Deterministic, zero-cost keyword/regex matcher. Returns null if nothing matches. */
export function matchIntercept(message: string): InterceptResult | null {
  // Preference-quick-action labels ("Something Rich", "Vegetarian", ...) are
  // checked first — an exact match must win over any looser keyword rule
  // that happens to share a word (e.g. the "vegetarian" info rule).
  const preference = matchPreference(message);
  if (preference) {
    return {
      source: "intercept",
      id: "preference_recommendation",
      text: preference.text,
      card: preference.card,
      quickActions: preference.actions,
    };
  }

  const normalized = normalize(message);
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return rule.respond();
    }
  }
  return null;
}

const COMPLAINT_PATTERN =
  /\b(terrible|awful|disgusting|appalling|rubbish|worst|refund|complain(t)?|disappoint(ed|ing)?|manager|unacceptable|furious|angry|ruined)\b/i;

/**
 * Handoff detection (spec §8, polish feature): distinct from matchIntercept
 * because it's a tone/escalation signal, not a factual Q&A — checked first
 * in the API route so a complaint never gets a cheerful menu recommendation.
 */
export function matchComplaint(message: string): boolean {
  return COMPLAINT_PATTERN.test(message);
}

export const COMPLAINT_RESPONSE =
  "I'm sorry to hear that — I'll pass this straight to the manager so they can put it right. Leave your number below and they'll call you personally.";
