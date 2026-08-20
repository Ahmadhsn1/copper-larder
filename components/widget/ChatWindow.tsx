"use client";

// The chat panel itself: header, scrollable transcript (with streaming
// bubbles + typing indicator + inline callback card), quick-reply chips for
// a fresh conversation, and the pinned input row. Purely presentational over
// the state `useChat` already owns — Widget.tsx wires the two together.
//
// Desktop: a fixed bottom-right panel. Mobile (below `sm`): a bottom sheet
// with a backdrop scrim, capped well short of full-screen so the page
// behind it is never entirely hidden.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Message } from "./Message";
import { CallbackCard } from "./CallbackCard";
import { HannahAvatar } from "./HannahAvatar";
import { QuickActions } from "./QuickActions";
import type { UseChatResult } from "./useChat";
import { OPENING_QUICK_ACTIONS } from "@/lib/quickActions";
import { getOpenStatus } from "@/lib/restaurant";
import { track } from "@/lib/analytics";

type ChatWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  chat: UseChatResult;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M17 3L9 11M17 3l-5.5 14-2.7-6.3L3 8.5 17 3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="mt-1 flex w-full items-end gap-2">
      <div className="w-7 shrink-0">
        <HannahAvatar size={28} />
      </div>
      <div className="animate-bubble-in flex items-center gap-2 rounded-lg rounded-bl-sm border border-charcoal/12 bg-offwhite px-4 py-3">
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className="h-1 w-1 animate-pulse rounded-full bg-copper/70"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span className="text-[12px] text-charcoal/50">Thinking…</span>
      </div>
    </div>
  );
}

export function ChatWindow({ isOpen, onClose, chat }: ChatWindowProps) {
  const { sessionId, messages, isStreaming, isTyping, send } = chat;
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback(() => {
    track("chat_closed");
    onClose();
  }, [onClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Lock the page behind the sheet from scrolling while it's open — most
  // noticeable on mobile, where the sheet floats over live page content
  // rather than replacing it full-screen.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Minimal focus trap: the dialog declares role="dialog" aria-modal="true",
  // so keyboard focus must not leak into the page behind it on Tab/Shift+Tab.
  const handleTrapTab = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  // Consecutive replies from Hannah are visually grouped — avatar only on
  // the first bubble of a run, tighter spacing between the rest — so the
  // transcript reads like a real conversation thread, not a form log.
  const firstInGroup = useMemo(() => {
    return messages.map((m, i) => i === 0 || messages[i - 1].role !== m.role);
  }, [messages]);

  // A short, time-aware opener for the empty-state greeting.
  const greetingLine = useMemo(() => {
    const status = getOpenStatus();
    return status === "lunch" ? "Good afternoon." : "Good evening.";
  }, []);

  if (!isOpen) return null;

  const lastMessage = messages[messages.length - 1];
  const isLastMessageStreaming = isStreaming && !!lastMessage && lastMessage.role === "model";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    track("chat_message_sent");
    send(text);
    setInputValue("");
  }

  return (
    <>
      {/* Mobile-only backdrop scrim — desktop's small corner panel doesn't need one. */}
      <div
        className="animate-concierge-scrim-in fixed inset-0 z-40 bg-charcoal/40 sm:hidden"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chat with Hannah, The Larder Concierge"
        onKeyDown={handleTrapTab}
        className="animate-concierge-sheet-in fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-cream sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100dvh-120px))] sm:max-h-none sm:w-[400px] sm:rounded-2xl sm:border sm:border-charcoal/15"
        style={{ boxShadow: "var(--shadow-window)" }}
      >
        <header className="relative flex shrink-0 items-center justify-between gap-3 border-b border-cream/10 bg-charcoal px-4 py-3">
          <div className="flex items-center gap-2.5">
            <HannahAvatar size={42} online className="ring-2 ring-cream/20 shadow-[0_2px_10px_rgba(23,22,19,0.35)]" />
            <div className="flex flex-col justify-center gap-0.5 leading-tight">
              <span className="text-[12px] uppercase tracking-[0.18em] text-copper-light">The Larder Concierge</span>
              <span className="font-serif text-[17px] text-cream">Hannah, your table-side guide</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close chat"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-cream/70 transition-colors duration-200 hover:bg-cream/10 hover:text-cream"
          >
            <CloseIcon />
          </button>
        </header>

        <div ref={scrollRef} className="chat-scroll min-h-0 flex-1 overflow-y-auto bg-cream px-4 py-4">
          <div className="flex flex-col gap-0.5">
            {messages.length === 0 && (
              <div className="mb-1 flex w-full items-end gap-2">
                <div className="w-7 shrink-0">
                  <HannahAvatar size={28} />
                </div>
                <div className="animate-bubble-in max-w-[82%] rounded-lg rounded-bl-sm border border-charcoal/12 bg-offwhite px-4 py-3 text-[15px] leading-relaxed text-charcoal shadow-[0_1px_2px_rgba(23,22,19,0.06)]">
                  <p className="font-serif text-[16px]">{greetingLine}</p>
                  <p className="mt-1.5">
                    I&apos;m the Larder Concierge. I can help you explore the menu, find something to suit your
                    table, or get you ready for a visit.
                  </p>
                  <p className="mt-1.5 text-charcoal/70">What can I help with?</p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                isStreaming={isLastMessageStreaming && index === messages.length - 1}
                isFirstInGroup={firstInGroup[index]}
                onQuickAction={send}
              >
                {message.role === "model" && message.showCallbackCard && <CallbackCard sessionId={sessionId} />}
              </Message>
            ))}

            {isTyping && <TypingIndicator />}
          </div>
        </div>

        {messages.length === 0 && (
          <div className="shrink-0 border-t border-charcoal/10 bg-cream px-4 py-3">
            <QuickActions actions={OPENING_QUICK_ACTIONS} onSend={send} />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-charcoal/10 bg-cream p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        >
          <div className="flex items-center gap-2">
            <label htmlFor="cl-chat-input" className="sr-only">
              Type a message
            </label>
            <div className="flex-1 rounded-full bg-offwhite shadow-[inset_0_1px_2px_rgba(23,22,19,0.05)] ring-1 ring-inset ring-charcoal/15 transition-all duration-200 focus-within:ring-2 focus-within:ring-copper/60">
              <input
                id="cl-chat-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isStreaming}
                placeholder="Ask the Larder…"
                autoComplete="off"
                className="h-11 w-full rounded-full bg-transparent px-4 text-[14px] text-charcoal placeholder:text-charcoal/40 outline-none disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={isStreaming || !inputValue.trim()}
              aria-label="Send message"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper text-cream transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-brown hover:shadow-[0_4px_14px_rgba(107,74,54,0.35)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none ${
                inputValue.trim() && !isStreaming ? "scale-100" : "scale-90"
              }`}
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
