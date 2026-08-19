// Renders one MENU entry (starters/mains/sides/desserts) as an editorial
// list of MenuItem rows. Pure presentation — no interactivity of its own.

import { MenuItem } from "./MenuItem";
import type { MenuSection } from "@/lib/restaurant";

type MenuCategoryProps = {
  section: MenuSection;
};

export function MenuCategory({ section }: MenuCategoryProps) {
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-charcoal/15 pb-3">
        <h3 className="font-serif text-2xl text-charcoal sm:text-3xl">{section.title}</h3>
        {section.note ? (
          <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-charcoal/45">
            {section.note}
          </span>
        ) : null}
      </div>
      <ul>
        {section.items.map((item) => (
          <MenuItem key={item.name} item={item} />
        ))}
      </ul>
    </div>
  );
}
