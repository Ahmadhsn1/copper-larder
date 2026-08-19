import { MENU, SUNDAY_ROAST, type DietTag, type MenuItem, type MenuSection } from "@/lib/restaurant";

const TAG_LABEL: Record<DietTag, string> = {
  v: "v",
  vg: "vg",
  "gf-adaptable": "gf adaptable",
};

function ItemTag({ tag }: { tag: DietTag }) {
  return (
    <span className="ml-2 inline-block rounded-full border border-border px-2 py-0.5 align-middle text-[11px] font-medium uppercase tracking-wide text-muted">
      {TAG_LABEL[tag]}
    </span>
  );
}

function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-border/70 py-4 last:border-b-0 sm:gap-8">
      <div className="min-w-0">
        <p className="font-serif text-lg text-ink sm:text-xl">
          {item.name}
          {item.tags?.map((tag) => (
            <ItemTag key={tag} tag={tag} />
          ))}
        </p>
        {item.description ? (
          <p className="mt-1 text-sm text-muted">{item.description}</p>
        ) : null}
      </div>
      <span className="shrink-0 font-serif text-lg text-accent sm:text-xl">{item.price}</span>
    </li>
  );
}

function MenuCategory({ section, index }: { section: MenuSection; index: number }) {
  return (
    <div
      className="reveal"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-2xl text-ink sm:text-3xl">{section.title}</h3>
        {section.note ? (
          <span className="text-xs uppercase tracking-wide text-muted">{section.note}</span>
        ) : null}
      </div>
      <ul>
        {section.items.map((item) => (
          <MenuItemRow key={item.name} item={item} />
        ))}
      </ul>
    </div>
  );
}

export function MenuPreview() {
  return (
    <section id="menu" className="border-t border-border bg-surface px-6 py-24 sm:px-10 md:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="reveal mb-14 max-w-xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-accent-2">
            On the table
          </p>
          <h2 className="font-serif text-4xl text-ink sm:text-5xl">The menu</h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Seasonal, mostly local, and changed often enough to keep the kitchen honest. Here&rsquo;s
            what&rsquo;s on at the minute.
          </p>
        </div>

        <div className="flex flex-col gap-14 sm:gap-16">
          {MENU.map((section, index) => (
            <MenuCategory key={section.id} section={section} index={index} />
          ))}
        </div>

        <div className="reveal mt-16 rounded-2xl border border-accent-2/20 bg-accent-2/5 px-6 py-6 sm:px-8">
          <p className="font-serif text-xl text-ink sm:text-2xl">Sunday roast</p>
          <p className="mt-2 text-sm text-muted sm:text-base">
            {SUNDAY_ROAST.price} &middot; served {SUNDAY_ROAST.hours} &middot; {SUNDAY_ROAST.note}
          </p>
        </div>
      </div>
    </section>
  );
}
