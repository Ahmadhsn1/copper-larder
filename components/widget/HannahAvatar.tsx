// Hannah's avatar — reused at every size the widget needs (launcher, header,
// message bubbles) so there's a single source of truth for "what Hannah
// looks like." Backed by public/hannah-avatar.jpg.

import Image from "next/image";

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
      <Image
        src="/hannah-avatar.jpg"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />

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
