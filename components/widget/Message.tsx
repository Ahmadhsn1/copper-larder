"use client";

// A single chat bubble. Bot replies show Hannah's avatar (once per group of
// consecutive replies) and a soft "tail" corner; user messages sit on the
// right in copper. Hovering a bubble reveals its timestamp — a small,
// unobtrusive touch that makes the conversation feel like a real thread
// rather than a static Q&A log. Renders a blinking caret while its own
// content is still streaming in, and can host inline content (a rich card,
// quick actions, or the callback-request form via `children`) below the
// bubble.

import type { ReactNode } from "react";
import { HannahAvatar } from "./HannahAvatar";
import type { ChatMessage } from "./useChat";
import { DishCard } from "./DishCard";
import { InfoCard } from "./InfoCard";
import { QuickActions } from "./QuickActions";

type MessageProps = {
  message: ChatMessage;
  /** True while this specific message's text is still being streamed in. */
  isStreaming?: boolean;
  /** False for a bot message immediately following another bot message — hides the repeated avatar and tightens spacing. */
  isFirstInGroup?: boolean;
  /** Called with the quick action's value/label when the visitor picks one of message.quickActions. */
  onQuickAction?: (text: string) => void;
  children?: ReactNode;
};

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(ts);
}

export function Message({
  message,
  isStreaming = false,
  isFirstInGroup = true,
  onQuickAction,
  children,
}: MessageProps) {
  const isUser = message.role === "user";
  const isBot = message.role === "model";

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
              ? "animate-bubble-in origin-bottom-right rounded-lg rounded-br-sm bg-copper px-4 py-3 text-[15px] leading-relaxed text-cream shadow-[0_1px_2px_rgba(23,22,19,0.12)] transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
              : "animate-bubble-in origin-bottom-left rounded-lg rounded-bl-sm border border-charcoal/12 bg-offwhite px-4 py-3 text-[15px] leading-relaxed text-charcoal shadow-[0_1px_2px_rgba(23,22,19,0.06)] transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
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
                  className="animate-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-charcoal/70 align-middle"
                />
              )}
            </span>
          )}
        </div>

        <span
          className={`px-1 text-[11px] text-charcoal/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.ts)}
        </span>

        {isBot && message.card && message.card.type === "dish" && (
          <DishCard
            name={message.card.name}
            description={message.card.description}
            price={message.card.price}
            tags={message.card.tags}
          />
        )}
        {isBot && message.card && message.card.type === "info" && (
          <InfoCard title={message.card.title} lines={message.card.lines} />
        )}

        {children}

        {isBot && message.quickActions && onQuickAction && (
          <QuickActions actions={message.quickActions} onSend={onQuickAction} />
        )}
      </div>
    </div>
  );
}
