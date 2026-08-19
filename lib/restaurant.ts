// Single source of truth for The Copper Larder's menu, hours, and location.
// Used by both the system prompt (lib/prompt.ts) and the landing page /
// intercepts, so a menu change never needs editing in two places.

export type DietTag = "v" | "vg" | "gf-adaptable";

export type MenuItem = {
  name: string;
  description: string;
  price: string;
  tags?: DietTag[];
};

export type MenuSection = {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
};

export const RESTAURANT = {
  name: "The Copper Larder",
  type: "Modern British bistro",
  address: "42 Brindley Place, Birmingham B1 2JB",
  phone: "0121 496 0180",
  phoneHref: "tel:+441214960180",
  pricePoint: "Mains £14–24",
  parking: "Brindley Place NCP is a two-minute walk. Street parking's free after 6.",
} as const;

export const SUNDAY_ROAST = {
  price: "£22pp",
  hours: "12–17",
  note: "booking advised",
} as const;

// day keys follow Date#getDay(): 0 = Sunday ... 6 = Saturday
export const HOURS: Record<number, { open: number; close: number } | null> = {
  0: { open: 12, close: 17 }, // Sunday
  1: null, // Monday closed
  2: { open: 12, close: 22 }, // Tuesday
  3: { open: 12, close: 22 }, // Wednesday
  4: { open: 12, close: 22 }, // Thursday
  5: { open: 12, close: 23 }, // Friday
  6: { open: 12, close: 23 }, // Saturday
};

export const HOURS_TEXT = "Tue–Thu 12–22 · Fri–Sat 12–23 · Sun 12–17 · Mon closed";

export const MENU: MenuSection[] = [
  {
    id: "starters",
    title: "Starters",
    items: [
      { name: "Cured Sea Trout", description: "dill & cucumber", price: "£9.50" },
      { name: "Wild Mushroom Toast", description: "Berkswell cheese", price: "£8.50", tags: ["v"] },
      { name: "Crispy Pig Cheek", description: "apple & mustard", price: "£10" },
      { name: "Soup of the Day", description: "v/vg on request", price: "£7", tags: ["v", "vg"] },
    ],
  },
  {
    id: "mains",
    title: "Mains",
    items: [
      { name: "Roast Chicken Supreme", description: "leek & tarragon", price: "£19" },
      { name: "Braised Feather Blade of Beef", description: "6hr, red wine", price: "£24" },
      { name: "Pan-Fried Hake", description: "brown shrimp butter", price: "£22" },
      { name: "Heritage Beetroot & Barley Risotto", description: "", price: "£16", tags: ["vg"] },
      { name: "Larder Burger", description: "aged cheddar, triple-cooked chips", price: "£16" },
    ],
  },
  {
    id: "sides",
    title: "Sides",
    note: "£4.50 each",
    items: [
      { name: "Triple-cooked chips", description: "", price: "£4.50" },
      { name: "Buttered greens", description: "", price: "£4.50" },
      { name: "Truffle mash", description: "", price: "£4.50" },
    ],
  },
  {
    id: "desserts",
    title: "Desserts",
    items: [
      { name: "Sticky Toffee Pudding", description: "", price: "£8" },
      { name: "Dark Chocolate Delice", description: "", price: "£8.50" },
      { name: "British Cheese Board", description: "", price: "£11" },
    ],
  },
];

// The exact compressed block that goes into the system prompt (spec ~800 tokens).
// Kept as a hand-written string (not re-serialized from MENU) so the compression
// used for cost control is explicit and auditable.
export const MENU_COMPRESSED_TEXT = `STARTERS
Cured Sea Trout, dill & cucumber — £9.50
Wild Mushroom Toast, Berkswell cheese — £8.50 (v)
Crispy Pig Cheek, apple & mustard — £10
Soup of the Day — £7 (v/vg on request)

MAINS
Roast Chicken Supreme, leek & tarragon — £19
Braised Feather Blade of Beef, 6hr, red wine — £24
Pan-Fried Hake, brown shrimp butter — £22
Heritage Beetroot & Barley Risotto — £16 (vg)
Larder Burger, aged cheddar, triple-cooked chips — £16

SIDES — £4.50
Triple-cooked chips · Buttered greens · Truffle mash

DESSERTS
Sticky Toffee Pudding — £8
Dark Chocolate Delice — £8.50
British Cheese Board — £11

SUNDAY ROAST — £22pp, 12–17, booking advised`;

export type OpenStatus = "lunch" | "evening" | "closed";

/** Time-aware open status in the restaurant's local timezone (Europe/London). */
export function getOpenStatus(date: Date = new Date()): OpenStatus {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const weekdayShort = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
  const hour = Number.parseInt(hourStr, 10);

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const day = weekdayMap[weekdayShort] ?? date.getDay();
  const today = HOURS[day];

  if (!today || hour < today.open || hour >= today.close) return "closed";
  return hour < 17 ? "lunch" : "evening";
}
