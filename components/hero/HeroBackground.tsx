"use client";

// Full-bleed hero background: the LCP image on the page, so `priority` is
// deliberate here and nowhere else. Exposes its two animatable layers
// (opacity wrapper, scale wrapper) via refs so Hero.tsx's single entrance
// timeline can drive them directly — this component owns no animation
// logic itself, only the DOM structure and the resting (reduced-motion)
// state, matching the Reveal/ImageReveal convention of gating on
// useReducedMotion() for the pre-JS/no-JS visible state.

import Image from "next/image";
import type { RefObject } from "react";
import { HERO_IMAGE } from "@/lib/images";
import { useReducedMotion } from "@/lib/useReducedMotion";

type HeroBackgroundProps = {
  /** Fades 0→1 as the entrance timeline's first beat. */
  wrapperRef: RefObject<HTMLDivElement | null>;
  /** Settles from a 1.08 scale down to 1, in lockstep with the fade. */
  imageRef: RefObject<HTMLDivElement | null>;
};

export function HeroBackground({ wrapperRef, imageRef }: HeroBackgroundProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-charcoal"
      style={reducedMotion ? undefined : { opacity: 0 }}
    >
      <div
        ref={imageRef}
        className="absolute inset-0"
        style={reducedMotion ? undefined : { transform: "scale(1.08)" }}
      >
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover"
        />
      </div>

      {/* Bottom-heavy charcoal wash — keeps the cream/white hero content
          readable over any part of the photo without flattening it. */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/0 via-charcoal/20 to-charcoal/75" />
    </div>
  );
}
