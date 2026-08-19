"use client";

// The chat panel itself: header, scrollable transcript (with streaming
// bubbles + typing indicator + inline callback card), quick-reply chips for
// a fresh conversation, and the pinned input row. Purely presentational over
// the state `useChat` already owns — Widget.tsx wires the two together.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { Message } from "./Message";
import { CallbackCard } from "./CallbackCard";
import { HannahAvatar } from "./HannahAvatar";
import type { UseChatResult } from "./useChat";

type ChatWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  chat: UseChatResult;
};

type QuickReply = { label: string; hint: string; icon: () => ReactElement };

function MenuIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M4 2v5.5M4 2c-1 0-1.5 1-1.5 2.2S3 7.5 4 7.5M4 2c1 0 1.5 1 1.5 2.2S5 7.5 4 7.5M4 7.5V14M12 2v12M12 2c1.4 0 2 1.3 2 3s-.6 3-2 3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.8V8l2.4 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M8 14s4.8-4.3 4.8-7.8A4.8 4.8 0 0 0 8 1.4a4.8 4.8 0 0 0-4.8 4.8C3.2 9.7 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.2" r="1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

const QUICK_REPLIES: QuickReply[] = [
  { label: "See menu", hint: "Starters to puddings", icon: MenuIcon },
  { label: "Opening hours", hint: "Today & the full week", icon: ClockIcon },
  { label: "Find us", hint: "Brindley Place, parking too", icon: PinIcon },
  { label: "Book a table", hint: "Ring, or leave your number", icon: CalendarIcon },
];

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
      <div className="animate-bubble-in flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3">
        <span className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span className="text-[12px] text-muted">Hannah&apos;s typing…</span>
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
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  const lastMessage = messages[messages.length - 1];
  const isLastMessageStreaming = isStreaming && !!lastMessage && lastMessage.role === "model";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    send(text);
    setInputValue("");
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Chat with Hannah, The Copper Larder"
      onKeyDown={handleTrapTab}
      className="animate-window-in fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-surface sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(600px,calc(100dvh-112px))] sm:w-[380px] sm:rounded-2xl sm:border sm:border-border"
      style={{ boxShadow: "var(--shadow-window)" }}
    >
      <header className="relative flex shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-border bg-surface px-4 py-3 sm:rounded-t-2xl">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.07] via-transparent to-accent-2/[0.06]"
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2.5">
          <HannahAvatar size={42} online className="ring-2 ring-surface shadow-[0_2px_10px_rgba(180,83,9,0.25)]" />
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-[17px] text-ink">Hannah</span>
            <span className="flex items-center gap-1.5 text-[12px] text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-2" aria-hidden="true" />
              Host at The Copper Larder
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-bg hover:text-ink"
        >
          <CloseIcon />
        </button>
      </header>

      <div ref={scrollRef} className="chat-texture chat-scroll flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-0.5">
          {messages.length === 0 && (
            <div className="mb-1 flex w-full items-end gap-2">
              <div className="w-7 shrink-0">
                <HannahAvatar size={28} />
              </div>
              <div className="animate-fade-up max-w-[78%] rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-2.5 text-[15px] leading-relaxed text-ink shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
                Hello, I&apos;m Hannah — ask me about the menu, opening hours, or getting a table.
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isStreaming={isLastMessageStreaming && index === messages.length - 1}
              isFirstInGroup={firstInGroup[index]}
            >
              {message.role === "model" && message.showCallbackCard && <CallbackCard sessionId={sessionId} />}
            </Message>
          ))}

          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {messages.length === 0 && (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border bg-surface px-4 py-3">
          {QUICK_REPLIES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => send(label)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-bg px-3.5 text-[13px] font-medium text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-[0_2px_8px_rgba(180,83,9,0.15)]"
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-border bg-surface p-3 sm:rounded-b-2xl"
      >
        <label htmlFor="cl-chat-input" className="sr-only">
          Type a message
        </label>
        <div className="flex-1 rounded-full bg-bg shadow-[inset_0_1px_2px_rgba(28,25,23,0.05)] ring-1 ring-inset ring-border transition-all duration-200 focus-within:ring-2 focus-within:ring-accent/60">
          <input
            id="cl-chat-input"
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask about the menu, hours, a table…"
            autoComplete="off"
            className="h-11 w-full rounded-full bg-transparent px-4 text-[14px] text-ink placeholder:text-muted/70 outline-none disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isStreaming || !inputValue.trim()}
          aria-label="Send message"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-accent-hover hover:shadow-[0_4px_14px_rgba(180,83,9,0.35)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none ${
            inputValue.trim() && !isStreaming ? "scale-100" : "scale-90"
          }`}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
