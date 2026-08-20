"use client";

// The floating trigger: a persistent pill-shaped button (not a bare icon —
// it's the concierge's own call-to-action) stacked directly above the
// WhatsApp button so the two are read as a deliberate pair, WhatsApp lowest
// and this pill just above it. Also owns the proactive greeting bubble
// that appears once, a few seconds after first paint, if the visitor
// hasn't opened the chat yet this tab.

import { useEffect, useRef, useState } from "react";
import { getOpenStatus } from "@/lib/restaurant";
import { track } from "@/lib/analytics";

type LauncherProps = {
  isOpen: boolean;
  hasOpenedOnce: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const GREETING_SHOWN_KEY = "cl_greeting_shown";
const GREETING_DELAY_MS = 4000;

const GREETING_COPY: Record<ReturnType<typeof getOpenStatus>, string> = {
  lunch: "Good afternoon — after the menu, or planning a visit?",
  evening: "Good evening — after the menu, or planning a visit?",
  closed: "We're closed just now, though very happy to help you plan a visit.",
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

// A chat glyph with a small spark — reads as a concierge call-to-action, not
// a generic support-widget icon. Shown on the launcher before it's ever been
// opened; Hannah's actual photo only appears once you're inside the
// conversation.
function SparkChatIcon({ size = 25 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h8A2.5 2.5 0 0 1 17 5.5v6A2.5 2.5 0 0 1 14.5 14H10l-4 3.4V14H6.5A2.5 2.5 0 0 1 4 11.5v-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 8.5l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7.7-1.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Launcher({ isOpen, hasOpenedOnce, onOpen, onClose }: LauncherProps) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const isOpenRef = useRef(isOpen);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Restore keyboard focus to the launcher when the dialog closes (Escape or
  // its own close button unmounts the previously-focused input entirely) —
  // skip the very first render so this never steals focus on page load.
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      buttonRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(GREETING_SHOWN_KEY)) return;

    const timer = window.setTimeout(() => {
      if (isOpenRef.current) return;
      window.sessionStorage.setItem(GREETING_SHOWN_KEY, "1");
      setGreeting(GREETING_COPY[getOpenStatus()]);
    }, GREETING_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  function handleLauncherClick() {
    setGreeting(null);
    if (isOpen) {
      onClose();
    } else {
      track("chat_opened");
      onOpen();
    }
  }

  function handleGreetingOpen() {
    setGreeting(null);
    track("chat_opened");
    onOpen();
  }

  return (
    <div className={`fixed bottom-24 right-6 z-40 ${isOpen ? "hidden sm:block" : "block"}`}>
      {greeting && !isOpen && (
        <div className="animate-fade-up absolute bottom-[calc(100%+14px)] right-0 flex w-72 items-start gap-2.5 rounded-2xl rounded-br-sm border border-copper/10 bg-offwhite p-3.5 pr-8 shadow-[0_1px_2px_rgba(23,22,19,0.05),0_8px_24px_rgba(23,22,19,0.08)]">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-copper text-cream">
            <SparkChatIcon size={16} />
          </span>
          <button
            type="button"
            onClick={() => setGreeting(null)}
            aria-label="Dismiss greeting"
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-charcoal/40 transition-colors duration-200 hover:bg-cream hover:text-charcoal"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" onClick={handleGreetingOpen} className="block flex-1 pt-0.5 text-left">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.08em] text-copper">
              Hannah
            </span>
            <span className="block font-serif text-[16px] leading-snug text-charcoal">{greeting}</span>
          </button>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={handleLauncherClick}
        aria-label={isOpen ? "Close chat" : "Open chat with Hannah"}
        className={`animate-launcher-pop relative flex items-center gap-2 rounded-full bg-copper py-3.5 pl-4 pr-5 text-cream shadow-[0_1px_2px_rgba(23,22,19,0.05),0_8px_24px_rgba(23,22,19,0.14)] transition-all duration-300 hover:scale-[1.035] hover:bg-copper-light ${
          isOpen ? "" : "animate-concierge-breathe"
        }`}
      >
        <span className="concierge-icon-swap" style={{ width: 22, height: 22 }}>
          <span className="concierge-icon-layer" data-visible={isOpen ? "false" : "true"}>
            <SparkChatIcon size={22} />
          </span>
          <span className="concierge-icon-layer" data-visible={isOpen ? "true" : "false"}>
            <CloseIcon />
          </span>
        </span>
        <span className="text-[13px] font-medium uppercase tracking-[0.08em]">
          {isOpen ? "Close chat" : "Ask the Larder"}
        </span>

        {!isOpen && !hasOpenedOnce && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5" aria-hidden="true">
            <span className="absolute inset-0 animate-ping rounded-full bg-copper-light opacity-75" />
            <span className="relative h-3.5 w-3.5 rounded-full border-2 border-offwhite bg-copper-light" />
          </span>
        )}
      </button>
    </div>
  );
}
