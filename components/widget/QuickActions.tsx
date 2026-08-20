"use client";

// Compact row of action chips shown under a chat message (or as the opening
// state). Purely presentational + click-routing — the actions themselves
// (labels, values, which kind) are decided upstream by lib/quickActions.ts
// and lib/intercepts.ts, never invented here.

import { RESTAURANT } from "@/lib/restaurant";
import { track } from "@/lib/analytics";
import type { QuickAction } from "@/lib/quickActions";

type QuickActionsProps = {
  actions: QuickAction[];
  onSend: (text: string) => void;
  className?: string;
};

const CHIP_CLASS =
  "flex h-9 items-center gap-1.5 rounded-full border border-charcoal/15 bg-offwhite px-3.5 text-[13px] font-medium text-charcoal transition-all duration-200 hover:-translate-y-0.5 hover:border-copper hover:text-copper";

function directionsHref(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(RESTAURANT.address)}`;
}

export function QuickActions({ actions, onSend, className }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div
      className={`animate-concierge-card-in flex flex-wrap items-center gap-2${className ? ` ${className}` : ""}`}
    >
      {actions.map((action, index) => {
        const key = `${action.kind}-${action.label}-${index}`;

        if (action.kind === "tel") {
          return (
            <a
              key={key}
              href={RESTAURANT.phoneHref}
              className={CHIP_CLASS}
              onClick={() => track("call_clicked", { label: action.label })}
            >
              {action.label}
            </a>
          );
        }

        if (action.kind === "directions") {
          return (
            <a
              key={key}
              href={directionsHref()}
              target="_blank"
              rel="noopener noreferrer"
              className={CHIP_CLASS}
              onClick={() => track("directions_clicked", { label: action.label })}
            >
              {action.label}
            </a>
          );
        }

        return (
          <button
            key={key}
            type="button"
            className={CHIP_CLASS}
            onClick={() => {
              track("quick_action_clicked", { label: action.label });
              onSend(action.value);
            }}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
