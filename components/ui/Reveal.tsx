"use client";

// The site's one scroll-reveal primitive (brief §25): opacity 0→1,
// translateY 40px→0, on enter. Every section leans on this instead of
// each one inventing its own reveal logic. Reduced motion: renders the
// final state immediately, no ScrollTrigger, no motion at all.

import { useEffect, useRef, type ReactNode, type Ref } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds, for grouping several Reveals in one visual beat. */
  delay?: number;
  /** Starting offset in px — smaller for subtler reveals (e.g. inline text rows). */
  distance?: number;
  as?: "div" | "section" | "li";
};

export function Reveal({ children, className = "", delay = 0, distance = 40, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reducedMotion, delay, distance]);

  const Tag = as;
  return (
    <Tag
      ref={ref as Ref<never>}
      className={className}
      style={reducedMotion ? undefined : { opacity: 0 }}
    >
      {children}
    </Tag>
  );
}
