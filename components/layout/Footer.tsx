"use client";

// Minimal, premium, dark footer (brief §23). Needs "use client" only for
// the scrollToSection nav-link handlers — no motion here otherwise, it's
// the calm final beat after the site's cinematic scroll.

import { HOURS_TEXT, RESTAURANT } from "@/lib/restaurant";
import { scrollToSection } from "@/lib/scrollTo";

const LINKS = [
  { label: "Menu", id: "menu" },
  { label: "About", id: "about" },
  { label: "Visit", id: "visit" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal px-6 py-20 text-cream sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-serif text-2xl">{RESTAURANT.name}</p>
            <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-cream/50">{RESTAURANT.type}</p>
          </div>

          <div className="text-[14px] leading-relaxed text-cream/70">
            <p>42 Brindley Place</p>
            <p>Birmingham B1 2JB</p>
            <a href={RESTAURANT.phoneHref} className="mt-2 block text-cream hover:text-copper-light">
              {RESTAURANT.phone}
            </a>
          </div>

          <div className="text-[14px] leading-relaxed text-cream/70">
            <p>{HOURS_TEXT}</p>
          </div>

          <nav className="flex flex-col gap-2 text-[13px] font-medium uppercase tracking-[0.14em] text-cream/70">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.id);
                }}
                className="hover:text-cream"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-cream/10 pt-8 sm:flex-row sm:items-center">
          <p className="font-serif text-3xl tracking-wide text-cream/90">Come hungry.</p>
          <p className="text-[12px] uppercase tracking-[0.14em] text-cream/40">
            &copy; 2026 {RESTAURANT.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
