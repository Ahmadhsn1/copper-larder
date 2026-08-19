// Brief §21 — a real, working embedded map for VisitSection. Plain iframe
// against Google's free basic Maps embed (no API key / billing required —
// distinct from the paid JS Maps API). Google's default embed chrome reads
// bright and generic against the site's charcoal/copper editorial palette,
// so it's heavily desaturated + warmed via CSS filter and set inside a
// copper-framed card with its own label and a real "Open in Maps" link,
// rather than dropping the bare widget straight onto the page.

import { RESTAURANT } from "@/lib/restaurant";

const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(RESTAURANT.address)}&output=embed`;
const MAP_LINK_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESTAURANT.address)}`;

export function MapSection() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-copper/25 bg-charcoal-soft shadow-[0_20px_50px_rgba(23,22,19,0.12)]">
      <iframe
        src={MAP_SRC}
        title={`Map showing ${RESTAURANT.name} at ${RESTAURANT.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full grayscale-[85%] sepia-[12%] contrast-[1.05] saturate-[1.1] brightness-[0.97]"
      />

      {/* Warm charcoal wash so Google's default bright chrome sits inside
          the site's palette rather than fighting it. Pointer-events-none —
          purely a tint, the map underneath stays fully interactive. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/15 via-transparent to-charcoal/5 mix-blend-multiply"
      />

      {/* Corner frame accents — reads as a considered, designed element
          rather than a bare embedded widget. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 sm:inset-4">
        <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-copper/70" />
        <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-copper/70" />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-copper/70" />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-copper/70" />
      </div>

      <a
        href={MAP_LINK_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-copper/30 bg-offwhite/90 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-charcoal shadow-[0_4px_16px_rgba(23,22,19,0.18)] backdrop-blur-sm transition-colors duration-300 hover:bg-copper hover:text-cream"
      >
        Open in Maps
      </a>
    </div>
  );
}
