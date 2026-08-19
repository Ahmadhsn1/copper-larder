import { RESTAURANT, SUNDAY_ROAST, HOURS_TEXT, getOpenStatus } from "./restaurant";

export type InterceptResult = {
  text: string;
  action?: "show_callback_card";
  source: "intercept";
  id: string;
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
    }),
  },
  {
    id: "parking",
    patterns: [/\bpark(ing)?\b/],
    respond: () => ({
      source: "intercept",
      id: "parking",
      text: RESTAURANT.parking,
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
    }),
  },
];

/** Deterministic, zero-cost keyword/regex matcher. Returns null if nothing matches. */
export function matchIntercept(message: string): InterceptResult | null {
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
