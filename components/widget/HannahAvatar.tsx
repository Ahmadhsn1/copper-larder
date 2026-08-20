// Hannah's avatar — reused at every size the widget needs (launcher, header,
// message bubbles) so there's a single source of truth for "what Hannah
// looks like." Backed by public/hannah-avatar.png. Grows and glows on
// hover by default — the picture itself is the interactive, alive part of
// the widget, not just a static badge.
//
// Plain <img>, not next/image: this file is already small (~18KB) and only
// ever rendered at tiny sizes, so the optimizer pipeline buys nothing —
// and its /_next/image proxy caches aggressively enough that swapping the
// underlying photo (same filename) can otherwise keep serving a stale one.

type HannahAvatarProps = {
  size?: number;
  className?: string;
  /** Small pulsing "online" dot, used in the chat header and launcher. */
  online?: boolean;
  /** Set false to disable the hover grow/glow (rare — used where a parent already owns the hover feel). */
  interactive?: boolean;
};

export function HannahAvatar({
  size = 40,
  className = "",
  online = false,
  interactive = true,
}: HannahAvatarProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${
        interactive
          ? "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:z-10 hover:scale-125"
          : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className={`block h-full w-full overflow-hidden rounded-full ${
          interactive ? "transition-shadow duration-300 hover:shadow-[0_6px_20px_rgba(180,83,9,0.35)]" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hannah-avatar.jpg"
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>

      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-surface bg-accent-2"
          style={{ width: size * 0.28, height: size * 0.28 }}
          aria-hidden="true"
        >
          <span className="block h-full w-full animate-ping rounded-full bg-accent-2 opacity-60" />
        </span>
      )}
    </span>
  );
}
