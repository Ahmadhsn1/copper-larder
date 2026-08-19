"use client";

// Wires up Lenis smooth scroll and syncs it with GSAP's ticker/ScrollTrigger
// — the standard modern integration recipe. Deliberately a no-op (renders
// children over plain native scroll) under reduced motion or on
// coarse-pointer (touch) devices: mobile gets native touch scrolling
// everywhere, never scroll-jacking.

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion, useFinePointer } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();

  useEffect(() => {
    if (reducedMotion || !finePointer) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 0, // native touch scrolling on any touch-capable device
    });

    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [reducedMotion, finePointer]);

  return <>{children}</>;
}
