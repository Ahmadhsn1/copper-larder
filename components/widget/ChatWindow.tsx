"use client";

// The chat panel itself: header, scrollable transcript (with streaming
// bubbles + typing indicator + inline callback card), quick-reply chips for
// a fresh conversation, and the pinned input row. Purely presentational over
// the state `useChat` already owns — Widget.tsx wires the two together.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Message } from "./Message";
import { CallbackCard } from "./CallbackCard";
import type { UseChatResult } from "./useChat";

type ChatWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  chat: UseChatResult;
};

const QUICK_REPLIES = ["See menu", "Opening hours", "Find us", "Book a table"];

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
    <div className="flex w-full justify-start">
      <div className="animate-bubble-in flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-muted"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatWindow({ isOpen, onClose, chat }: ChatWindowProps) {
  const { sessionId, messages, isStreaming, isTyping, send } = chat;
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
      role="dialog"
      aria-modal="true"
      aria-label="Chat with Hannah, The Copper Larder"
      className="animate-window-in fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-surface sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:w-[380px] sm:rounded-2xl sm:border sm:border-border"
      style={{ boxShadow: "var(--shadow-window)" }}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 font-serif text-[15px] text-accent">
            H
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-[15px] text-ink">Hannah</span>
            <span className="text-[12px] text-muted">The Copper Larder</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-bg hover:text-ink"
        >
          <CloseIcon />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="animate-fade-up rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-2.5 text-[15px] leading-relaxed text-ink">
              Hello, I&apos;m Hannah — ask me about the menu, opening hours, or getting a table.
            </div>
          )}

          {messages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isStreaming={isLastMessageStreaming && index === messages.length - 1}
            >
              {message.role === "model" && message.showCallbackCard && <CallbackCard sessionId={sessionId} />}
            </Message>
          ))}

          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {messages.length === 0 && (
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border px-4 py-3">
          {QUICK_REPLIES.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => send(label)}
              className="h-9 rounded-full border border-border bg-bg px-3.5 text-[13px] font-medium text-ink transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t border-border p-3 sm:rounded-b-2xl">
        <label htmlFor="cl-chat-input" className="sr-only">
          Type a message
        </label>
        <input
          id="cl-chat-input"
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isStreaming}
          placeholder="Ask about the menu, hours, a table…"
          autoComplete="off"
          className="h-11 flex-1 rounded-full border border-border bg-bg px-4 text-[14px] text-ink placeholder:text-muted/70 outline-none focus-visible:border-accent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isStreaming || !inputValue.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
