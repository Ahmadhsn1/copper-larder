// Inline dish card, shown under a bot message whenever the reply centres on
// a single menu item (see lib/quickActions.ts: matchPreference/detectDishCard).
// Presentation-only — a "View Menu" quick action renders separately, so this
// card carries no button of its own.

import type { DietTag } from "@/lib/restaurant";

const TAG_LABEL: Record<DietTag, string> = {
  v: "Vegetarian",
  vg: "Vegan",
  "gf-adaptable": "GF Adaptable",
};

type DishCardProps = {
  name: string;
  description: string;
  price: string;
  tags?: DietTag[];
};

export function DishCard({ name, description, price, tags }: DishCardProps) {
  return (
    <div className="animate-concierge-card-in w-full rounded-lg border border-charcoal/12 bg-offwhite p-4 shadow-[0_1px_2px_rgba(23,22,19,0.04),0_8px_20px_rgba(23,22,19,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <p className="min-w-0 text-[13px] font-medium uppercase tracking-[0.14em] text-charcoal">
          {name}
        </p>
        <p className="shrink-0 font-serif text-lg text-copper">{price}</p>
      </div>

      {description ? (
        <p className="mt-1.5 text-[13px] text-charcoal/60">{description}</p>
      ) : null}

      {tags && tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium uppercase tracking-[0.18em] text-olive"
            >
              {TAG_LABEL[tag]}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
