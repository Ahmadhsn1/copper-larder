// Hannah's illustrated avatar — a warm, editorial flat-illustration portrait
// built entirely from vector shapes in the brand palette. Reused at every
// size the widget needs (launcher, header, message bubbles) so there's a
// single source of truth for "what Hannah looks like."
//
// No stock photography, no external image asset: consistent with the rest
// of the site's typographic/editorial direction, loads instantly, and
// stays crisp at any size.

type HannahAvatarProps = {
  size?: number;
  className?: string;
  /** Small pulsing "online" dot, used in the chat header and launcher. */
  online?: boolean;
};

export function HannahAvatar({ size = 40, className = "", online = false }: HannahAvatarProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="hannah-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBEEDF" />
            <stop offset="100%" stopColor="#F3D9BB" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="64" height="64" fill="url(#hannah-bg)" />

        {/* shoulders / shirt */}
        <ellipse cx="32" cy="68" rx="27" ry="20" fill="#FAF8F5" stroke="#E7C9A2" strokeWidth="1" />

        {/* neck */}
        <rect x="26" y="39" width="12" height="15" rx="5" fill="#E2A876" />

        {/* hair — back */}
        <path
          d="M13 30c0-12 8.5-20 19-20s19 8 19 20c0 5-1 10-3 14-1-6-2-9-4-9 1-6-1-11-6-13-2 4-7 6-12 6-4 0-7-1-9-3-3 3-4 8-4 14-2-4-3-9-3-9Z"
          fill="#B45309"
        />

        {/* face */}
        <ellipse cx="32" cy="30" rx="14.5" ry="16" fill="#EAB587" />

        {/* hair — fringe / side part */}
        <path
          d="M18.5 25c1-6 3-11 8-13 1 3 3 5 6 5.5-3 1-5 3-6 6-1-1.5-3-2-4-1-1 1-1.5 3-1.5 5-1-1-2-1.5-2.5-2.5Z"
          fill="#9A4508"
        />
        <path
          d="M45.5 25c-.8-5.5-2.7-10-6.8-12.6.6 2.6 2 4.4 4.3 5.6-2 .8-3.4 2.6-3.9 5 1.1-.9 2.6-1.1 3.5-.2.8.9 1 2.4.9 4 .8-.7 1.5-1.2 2-1.8Z"
          fill="#9A4508"
        />

        {/* ears */}
        <circle cx="18.5" cy="31" r="2.6" fill="#EAB587" />
        <circle cx="45.5" cy="31" r="2.6" fill="#EAB587" />

        {/* blush */}
        <ellipse cx="23.5" cy="34" rx="3" ry="1.8" fill="#B45309" opacity="0.18" />
        <ellipse cx="40.5" cy="34" rx="3" ry="1.8" fill="#B45309" opacity="0.18" />

        {/* eyes */}
        <ellipse cx="26" cy="29" rx="1.6" ry="2" fill="#1C1917" />
        <ellipse cx="38" cy="29" rx="1.6" ry="2" fill="#1C1917" />

        {/* smile */}
        <path
          d="M25.5 36c2 2.2 11 2.2 13 0"
          fill="none"
          stroke="#1C1917"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

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
