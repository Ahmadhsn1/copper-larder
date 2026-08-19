"use client";

// Clip-path inset reveal + gentle scale-settle for editorial images (brief
// §25). Wraps a next/image (or any element) — the wrapper owns overflow
// clipping so the scale-down settle never leaks outside the frame.

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type ImageRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ImageReveal({ children, className = "", delay = 0 }: ImageRevealProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner || reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrapper, start: "top 80%", once: true },
        delay,
      });
      tl.fromTo(
        wrapper,
        { clipPath: "inset(8% 8% 8% 8%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power3.out" },
      ).fromTo(inner, { scale: 1.15 }, { scale: 1, duration: 1.3, ease: "power3.out" }, 0);
    }, wrapper);

    return () => ctx.revert();
  }, [reducedMotion, delay]);

  return (
    <div ref={wrapperRef} className={`overflow-hidden ${className}`}>
      <div ref={innerRef} className="relative h-full w-full">
        {children}
      </div>
    </div>
  );
}
