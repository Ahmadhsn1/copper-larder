"use client";

// A real, working WhatsApp deep link — opens a prefilled chat with the
// restaurant on wa.me. Sits at the very bottom of the floating stack, with
// the AI host's pill launcher (Launcher.tsx) directly above it. The gentle
// bob + pulse ring read as "alive" without being distracting.

import { RESTAURANT } from "@/lib/restaurant";

const WHATSAPP_HREF = `https://wa.me/44${RESTAURANT.phoneHref.replace("tel:+44", "")}?text=${encodeURIComponent(
  "Hi! I'd like to ask about The Copper Larder.",
)}`;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.78.47 3.45 1.28 4.9L2 22l5.32-1.39a9.87 9.87 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.06.09-3.42-.75-2.88-1.04-4.74-3.95-4.88-4.14-.14-.19-1.16-1.55-1.16-2.96s.73-2.1 1-2.39c.24-.26.53-.32.71-.32.18 0 .35.002.5.008.16.007.38-.06.6.46.24.57.79 1.98.86 2.13.07.14.11.31.02.5-.09.18-.13.3-.26.46-.13.16-.28.35-.4.47-.13.13-.27.28-.12.55.16.28.7 1.16 1.51 1.88 1.04.93 1.91 1.22 2.19 1.36.28.13.44.11.6-.07.16-.18.68-.79.87-1.06.18-.28.36-.23.6-.14.24.09 1.53.72 1.79.85.26.13.44.19.5.3.07.13.07.7-.17 1.38Z" />
    </svg>
  );
}

export function WhatsAppButton({ hidden }: { hidden: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-40 ${hidden ? "hidden sm:block" : "block"}`}>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Message ${RESTAURANT.name} on WhatsApp`}
        className="animate-whatsapp-pulse relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_1px_2px_rgba(28,25,23,0.06),0_8px_20px_rgba(37,211,102,0.28)] transition-transform duration-300 hover:scale-105"
      >
        <span className="animate-whatsapp-bob flex">
          <WhatsAppIcon />
        </span>
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3" aria-hidden="true">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-75" />
          <span className="relative h-3 w-3 rounded-full border-2 border-bg bg-[#25D366]" />
        </span>
      </a>
    </div>
  );
}
