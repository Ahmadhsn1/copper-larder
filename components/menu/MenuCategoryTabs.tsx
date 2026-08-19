"use client";

// The category switcher (brief §14): STARTERS / MAINS / SIDES / DESSERTS /
// SUNDAY ROAST. A single shared indicator element slides between tabs
// (rather than each tab drawing its own underline), and the visible
// category crossfades in on switch. Sunday Roast isn't MENU data — it's
// rendered straight from the SUNDAY_ROAST export as a single elegant block.

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import Image from "next/image";
import { MENU, SUNDAY_ROAST } from "@/lib/restaurant";
import { SUNDAY_ROAST_IMAGE } from "@/lib/images";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { MenuCategory } from "./MenuCategory";

const SUNDAY_ROAST_TAB_ID = "sunday-roast";

const TABS = [
  ...MENU.map((section) => ({ id: section.id, label: section.title })),
  { id: SUNDAY_ROAST_TAB_ID, label: "Sunday Roast" },
];

function SundayRoastPanel() {
  return (
    <div className="grid gap-8 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center sm:gap-12">
      <ImageReveal className="relative mx-auto aspect-[4/5] w-full max-w-[220px] sm:mx-0">
        <Image
          src={SUNDAY_ROAST_IMAGE.src}
          alt={SUNDAY_ROAST_IMAGE.alt}
          fill
          sizes="(min-width: 640px) 220px, 60vw"
          className="object-cover"
        />
      </ImageReveal>

      <div>
        <h3 className="font-serif text-2xl text-charcoal sm:text-3xl">Sunday Roast</h3>
        <p className="mt-3 max-w-sm text-sm text-charcoal/55">
          One dish, done properly — served every Sunday while the ovens are on.
        </p>
        <dl className="mt-6 flex flex-wrap items-baseline gap-x-10 gap-y-4 border-t border-charcoal/15 pt-5">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-charcoal/45">Price</dt>
            <dd className="mt-1 font-serif text-xl text-charcoal sm:text-2xl">{SUNDAY_ROAST.price}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-charcoal/45">Served</dt>
            <dd className="mt-1 font-serif text-xl text-charcoal sm:text-2xl">{SUNDAY_ROAST.hours}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.18em] text-charcoal/45">Note</dt>
            <dd className="mt-1 text-sm text-charcoal/70">{SUNDAY_ROAST.note}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function TabPanel({ children, reducedMotion }: { children: ReactNode; reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return <div ref={ref}>{children}</div>;
}

export function MenuCategoryTabs() {
  const [active, setActive] = useState<string>(TABS[0].id);
  const reducedMotion = useReducedMotion();

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const isFirstIndicatorRun = useRef(true);

  const contentRef = useRef<HTMLDivElement | null>(null);

  // Slide the single shared indicator to sit under the active tab.
  useEffect(() => {
    const list = tabListRef.current;
    const indicator = indicatorRef.current;
    const btn = tabRefs.current[active];
    if (!list || !indicator || !btn) return;

    const listRect = list.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const x = btnRect.left - listRect.left;
    const width = btnRect.width;

    if (reducedMotion || isFirstIndicatorRun.current) {
      gsap.set(indicator, { x, width });
    } else {
      gsap.to(indicator, { x, width, duration: 0.5, ease: "power3.out" });
    }
    isFirstIndicatorRun.current = false;

    function handleResize() {
      const l = tabListRef.current;
      const b = tabRefs.current[active];
      const i = indicatorRef.current;
      if (!l || !b || !i) return;
      const lr = l.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      gsap.set(i, { x: br.left - lr.left, width: br.width });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [active, reducedMotion]);

  const activeSection = MENU.find((section) => section.id === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Menu categories"
        ref={tabListRef}
        className="relative flex gap-8 overflow-x-auto border-b border-charcoal/15"
      >
        {TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              id={`menu-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`menu-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`shrink-0 whitespace-nowrap pb-4 text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${
                selected ? "text-charcoal" : "text-charcoal/40 hover:text-charcoal/70"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-copper"
        />
      </div>

      <div ref={contentRef} className="relative mt-10 sm:mt-12">
        <div
          key={active}
          id={`menu-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`menu-tab-${active}`}
          tabIndex={0}
        >
          <TabPanel reducedMotion={reducedMotion}>
            {active === SUNDAY_ROAST_TAB_ID ? (
              <SundayRoastPanel />
            ) : activeSection ? (
              <MenuCategory section={activeSection} />
            ) : null}
          </TabPanel>
        </div>
      </div>
    </div>
  );
}
