"use client";

// Top-level mount point for the whole floating chat widget. Owns the single
// useChat() instance and the open/closed boolean, and hands both down to
// Launcher and ChatWindow so state lives in exactly one place.

import { useState } from "react";
import { Launcher } from "./Launcher";
import { ChatWindow } from "./ChatWindow";
import { useChat } from "./useChat";

export function Widget() {
  const [isOpen, setIsOpen] = useState(false);
  const chat = useChat();

  return (
    <>
      <Launcher isOpen={isOpen} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)} />
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} chat={chat} />
    </>
  );
}
