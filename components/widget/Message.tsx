"use client";

// A single chat bubble. Bot replies show Hannah's avatar (once per group of
// consecutive replies) and a soft "tail" corner; user messages sit on the
// right in copper. Hovering a bubble reveals its timestamp — a small,
// unobtrusive touch that makes the conversation feel like a real thread
// rather than a static Q&A log. Renders a blinking caret while its own
// content is still streaming in, and can host an inline card (the
// callback-request form) below the bubble via `children`.

import type { ReactNode } from "react";
import { HannahAvatar } from "./HannahAvatar";
import type { ChatMessage } from "./useChat";

type MessageProps = {
  message: ChatMessage;
  /** True while this specific message's text is still being streamed in. */
  isStreaming?: boolean;
  /** False for a bot message immediately following another bot message — hides the repeated avatar and tightens spacing. */
  isFirstInGroup?: boolean;
  children?: ReactNode;
};

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(ts);
}

export function Message({ message, isStreaming = false, isFirstInGroup = true, children }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`group flex w-full items-end gap-2 ${isUser ? "justify-end" : "justify-start"} ${
        isFirstInGroup ? "mt-1" : "mt-0.5"
      }`}
    >
      {!isUser && (
        <div className="w-7 shrink-0">
          {isFirstInGroup && <HannahAvatar size={28} className="animate-bubble-in" />}
        </div>
      )}

      <div className={`flex max-w-[78%] flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "animate-bubble-in origin-bottom-right rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-[0_1px_2px_rgba(28,25,23,0.06)] transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
              : "animate-bubble-in origin-bottom-left rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-2.5 text-[15px] leading-relaxed text-ink shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
          }
        >
          {isUser ? (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          ) : (
            <span
              aria-live={isStreaming ? "off" : "polite"}
              aria-busy={isStreaming || undefined}
              className="whitespace-pre-wrap break-words"
            >
              {message.content}
              {isStreaming && (
                <span
                  aria-hidden="true"
                  className="animate-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-ink/70 align-middle"
                />
              )}
            </span>
          )}
        </div>

        <span
          className={`px-1 text-[11px] text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.ts)}
        </span>

        {children}
      </div>
    </div>
  );
}
