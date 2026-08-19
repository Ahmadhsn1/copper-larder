"use client";

// Top-level mount point for the whole floating chat widget. Owns the single
// useChat() instance and the open/closed boolean, and hands both down to
// Launcher and ChatWindow so state lives in exactly one place.

import { useEffect, useState } from "react";
import { Launcher } from "./Launcher";
import { ChatWindow } from "./ChatWindow";
import { WhatsAppButton } from "./WhatsAppButton";
import { useChat } from "./useChat";
import { OPEN_CHAT_EVENT } from "@/lib/openChat";

export function Widget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const chat = useChat();

  function open() {
    setIsOpen(true);
    setHasOpenedOnce(true);
  }

  // "Book a table" CTAs across the marketing site are real, working
  // buttons — they open this widget (which already has a genuine
  // callback-card → leads flow) rather than faking a booking form.
  useEffect(() => {
    window.addEventListener(OPEN_CHAT_EVENT, open);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, open);
  }, []);

  return (
    <>
      <WhatsAppButton hidden={isOpen} />
      <Launcher isOpen={isOpen} hasOpenedOnce={hasOpenedOnce} onOpen={open} onClose={() => setIsOpen(false)} />
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} chat={chat} />
    </>
  );
}
