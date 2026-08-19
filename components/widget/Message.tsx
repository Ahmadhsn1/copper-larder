"use client";

// A single chat bubble: bot replies on the left with a soft "tail" corner,
// user messages on the right in copper. Renders a blinking caret while its
// own content is still streaming in, and can host an inline card (the
// callback-request form) below the bubble via `children`.

import type { ReactNode } from "react";
import type { ChatMessage } from "./useChat";

type MessageProps = {
  message: ChatMessage;
  /** True while this specific message's text is still being streamed in. */
  isStreaming?: boolean;
  /** Optional inline content rendered below the bubble (e.g. CallbackCard). */
  children?: ReactNode;
};

export function Message({ message, isStreaming = false, children }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "animate-bubble-in rounded-2xl bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-white"
              : "animate-bubble-in rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-2.5 text-[15px] leading-relaxed text-ink"
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
        {children}
      </div>
    </div>
  );
}
