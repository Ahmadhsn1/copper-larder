"use client";

// The floating trigger button. Also owns the proactive greeting bubble that
// appears once, a few seconds after first paint, if the visitor hasn't
// opened the chat yet this tab.

import { useEffect, useRef, useState } from "react";
import { getOpenStatus } from "@/lib/restaurant";

type LauncherProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

const GREETING_SHOWN_KEY = "cl_greeting_shown";
const GREETING_DELAY_MS = 4000;

const GREETING_COPY: Record<ReturnType<typeof getOpenStatus>, string> = {
  lunch: "Afternoon \u{1F44B} After the menu, or planning a visit?",
  evening: "Evening \u{1F44B} After the menu, or planning a visit?",
  closed: "We're closed right now, but happy to help you plan a visit \u{1F44B}",
};

function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function Launcher({ isOpen, onOpen, onClose }: LauncherProps) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
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
    if (isOpen) onClose();
    else onOpen();
  }

  function handleGreetingOpen() {
    setGreeting(null);
    onOpen();
  }

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${isOpen ? "hidden sm:block" : "block"}`}>
      {greeting && !isOpen && (
        <div className="animate-fade-up absolute bottom-[calc(100%+12px)] right-0 w-64 rounded-2xl rounded-br-sm border border-border bg-surface p-3.5 pr-8 text-[14px] leading-snug text-ink shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.06)]">
          <button
            type="button"
            onClick={() => setGreeting(null)}
            aria-label="Dismiss greeting"
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-bg hover:text-ink"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" onClick={handleGreetingOpen} className="block w-full text-left">
            {greeting}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleLauncherClick}
        aria-label={isOpen ? "Close chat" : "Open chat with Hannah"}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.06)] transition-all duration-300 hover:scale-105 hover:bg-accent-hover ${
          isOpen ? "" : "animate-launcher-pulse"
        }`}
      >
        {isOpen ? <CloseIcon /> : <ChatBubbleIcon />}
      </button>
    </div>
  );
}
