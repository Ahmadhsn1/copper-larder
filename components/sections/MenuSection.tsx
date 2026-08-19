// The full editorial menu experience (brief §14) — header + category tabs.
// A Server Component: the only interactivity lives inside MenuCategoryTabs.

import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MenuCategoryTabs } from "@/components/menu/MenuCategoryTabs";

export function MenuSection() {
  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="bg-offwhite px-6 py-24 sm:px-10 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal as="div" className="max-w-xl">
          <SectionLabel tone="copper">On the Table</SectionLabel>
          <h2 id="menu-heading" className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">
            The Menu
          </h2>
          <p className="mt-4 text-base text-charcoal/60 sm:text-lg">
            Seasonal, mostly local, and changed often enough to keep the kitchen honest. Here&rsquo;s
            what&rsquo;s on at the minute.
          </p>
        </Reveal>

        <Reveal as="div" delay={0.15} className="mt-14 sm:mt-16">
          <MenuCategoryTabs />
        </Reveal>
      </div>
    </section>
  );
}
