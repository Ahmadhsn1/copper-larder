export const OPEN_CHAT_EVENT = "copper-larder:open-chat";

/** Opens the chat widget — used by every "Book a table" CTA on the marketing site. */
export function openBookingChat(): void {
  window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
}
