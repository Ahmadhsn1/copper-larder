// Provider-agnostic analytics hook (brief §48). No analytics provider is
// wired into this project — this is just the integration point so one can
// be dropped in later without touching call sites. Checks for a couple of
// common globals if they happen to exist; otherwise a clean no-op.

export type AnalyticsEvent =
  | "chat_opened"
  | "chat_closed"
  | "chat_message_sent"
  | "quick_action_clicked"
  | "menu_recommendation_clicked"
  | "booking_clicked"
  | "call_clicked"
  | "directions_clicked";

type Payload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Payload }) => void;
  }
}

export function track(event: AnalyticsEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, payload);
    window.plausible?.(event, { props: payload });
  } catch {
    // Analytics must never break the chat experience.
  }
}
