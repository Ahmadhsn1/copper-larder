"use client";

// Floating glass-capsule nav: a frosted, rounded bar that sits clear of the
// hero photo at rest and tightens into a denser frosted pill once scrolled
// (brief §11, refined per request for a modern glassmorphic restaurant-nav
// treatment). Section links scroll-to via the shared Lenis-aware helper;
// the booking CTA opens the real chat widget rather than a fake form.

import { useEffect, useState } from "react";
import { RESTAURANT } from "@/lib/restaurant";
import { scrollToSection } from "@/lib/scrollTo";
import { openBookingChat } from "@/lib/openChat";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { label: "Menu", id: "menu" },
  { label: "About", id: "about" },
  { label: "Visit", id: "visit" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 72);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || mobileOpen;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 transition-[padding] duration-500 sm:px-6 sm:pt-5">
        <nav
          className={`mx-auto flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border transition-all duration-500 ${
            solid
              ? "border-charcoal/10 bg-offwhite/75 px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_30px_rgba(23,22,19,0.12)] backdrop-blur-xl sm:px-7"
              : "border-cream/20 bg-charcoal/15 px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-md sm:px-8 sm:py-3.5"
          }`}
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`font-serif text-[15px] font-medium uppercase tracking-[0.18em] transition-colors duration-500 ${
              solid ? "text-charcoal" : "text-cream"
            }`}
          >
            {RESTAURANT.name}
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={`group relative text-[13px] font-medium uppercase tracking-[0.14em] transition-colors duration-500 ${
                  solid ? "text-charcoal/80 hover:text-charcoal" : "text-cream/85 hover:text-cream"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full ${
                    solid ? "bg-copper" : "bg-cream"
                  }`}
                />
              </button>
            ))}

            <MagneticButton
              onClick={openBookingChat}
              className={`rounded-full px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors duration-500 ${
                solid ? "bg-copper text-cream hover:bg-copper-light" : "bg-cream/95 text-charcoal hover:bg-cream"
              }`}
            >
              Book a Table
            </MagneticButton>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className={`flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden ${
              solid ? "text-charcoal" : "text-cream"
            }`}
          >
            <span className="block h-px w-5 bg-current" />
            <span className="block h-px w-5 bg-current" />
          </button>
        </nav>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={NAV_LINKS}
        onNavigate={(id) => scrollToSection(id)}
      />
    </>
  );
}
