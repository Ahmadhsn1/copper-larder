"use client";

// Small "Scroll" cue, bottom-center of the hero. Its wrapper opacity is
// driven by Hero.tsx's entrance timeline (it's the last beat to arrive) via
// the forwarded ref; the slow idle translateY loop on the line beneath it
// is this component's own concern, run through GSAP so it shares the same
// reduced-motion gate as everything else on the page — under reduced
// motion the loop simply never starts and the line sits still.

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

type ScrollIndicatorProps = {
  wrapperRef: RefObject<HTMLDivElement | null>;
};

export function ScrollIndicator({ wrapperRef }: ScrollIndicatorProps) {
  const reducedMotion = useReducedMotion();
  const lineRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el || reducedMotion) return;

    const idle = gsap.to(el, {
      y: 6,
      duration: 1,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 1.8, // let the entrance sequence land first
    });

    return () => {
      idle.kill();
      gsap.set(el, { y: 0 });
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={reducedMotion ? undefined : { opacity: 0 }}
      className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 sm:bottom-10"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-cream/60">Scroll</span>
      <span ref={lineRef} className="block h-10 w-px bg-cream/40" />
    </div>
  );
}
