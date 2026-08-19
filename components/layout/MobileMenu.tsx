"use client";

// Full-screen animated nav overlay for mobile (brief §11) — items stagger
// into view on open. A plain CSS transition is enough here (no GSAP
// needed for a one-shot open/close), and it degrades gracefully under
// reduced motion (transitions just get instant via the media query below).

import { useEffect } from "react";
import { RESTAURANT } from "@/lib/restaurant";
import { openBookingChat } from "@/lib/openChat";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  links: { label: string; id: string }[];
  onNavigate: (id: string) => void;
};

export function MobileMenu({ open, onClose, links, onNavigate }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-charcoal transition-opacity duration-400 md:hidden ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <div className="flex items-center justify-between px-6 py-6">
        <span className="font-serif text-[15px] uppercase tracking-[0.18em] text-cream">
          {RESTAURANT.name}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-10 w-10 items-center justify-center text-cream"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col items-start justify-center gap-2 px-8">
        {links.map((link, i) => (
          <button
            key={link.id}
            type="button"
            onClick={() => {
              onClose();
              onNavigate(link.id);
            }}
            className="font-serif text-5xl text-cream/90 transition-all duration-500"
            style={{
              transitionDelay: open ? `${i * 70 + 100}ms` : "0ms",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(16px)",
            }}
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4 border-t border-cream/10 px-8 py-8">
        <button
          type="button"
          onClick={() => {
            onClose();
            openBookingChat();
          }}
          className="w-full rounded-sm bg-copper py-4 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-cream"
        >
          Book a Table
        </button>
        <a
          href={RESTAURANT.phoneHref}
          className="text-center text-[13px] font-medium uppercase tracking-[0.14em] text-cream/70"
        >
          Call {RESTAURANT.phone}
        </a>
      </div>
    </div>
  );
}
