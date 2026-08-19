"use client";

// One dish row (brief §14) — typography-driven, no cards. On desktop, hover
// nudges the title right, tints the price copper, and slides in a small
// arrow, all gated on useFinePointer() so touch never gets a "stuck" hover.

import { useFinePointer } from "@/lib/useReducedMotion";
import type { DietTag, MenuItem as MenuItemData } from "@/lib/restaurant";

const TAG_LABEL: Record<DietTag, string> = {
  v: "Vegetarian",
  vg: "Vegan",
  "gf-adaptable": "GF Adaptable",
};

type MenuItemProps = {
  item: MenuItemData;
};

export function MenuItem({ item }: MenuItemProps) {
  const interactive = useFinePointer();

  return (
    <li className="group/row border-b border-charcoal/10 py-5 first:pt-0 last:border-b-0">
      <div className="flex items-baseline justify-between gap-6">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={`flex items-baseline gap-1.5 font-serif text-xl text-charcoal sm:text-2xl ${
              interactive
                ? "transition-transform duration-500 ease-out group-hover/row:translate-x-1.5"
                : ""
            }`}
          >
            {item.name}
            <span
              aria-hidden="true"
              className={
                interactive
                  ? "inline-block -translate-x-1 text-base text-copper opacity-0 transition-all duration-500 ease-out group-hover/row:translate-x-0 group-hover/row:opacity-100"
                  : "hidden"
              }
            >
              &rarr;
            </span>
          </span>

          {item.tags?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium uppercase tracking-[0.18em] text-olive"
            >
              {TAG_LABEL[tag]}
            </span>
          ))}
        </div>

        <span
          className={`shrink-0 font-serif text-xl text-charcoal sm:text-2xl ${
            interactive ? "transition-colors duration-500 ease-out group-hover/row:text-copper" : ""
          }`}
        >
          {item.price}
        </span>
      </div>

      {item.description ? (
        <p className="mt-1.5 max-w-md text-sm text-charcoal/55">{item.description}</p>
      ) : null}
    </li>
  );
}
