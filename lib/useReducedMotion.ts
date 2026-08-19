"use client";

import { useEffect, useState } from "react";

/**
 * True when the visitor has requested reduced motion. Every GSAP timeline,
 * ScrollTrigger reveal, parallax, and the custom cursor/magnetic buttons
 * gate on this.
 *
 * Deliberately starts `false` (matching the server-rendered value) and only
 * reads the real matchMedia result inside an effect — reading it during the
 * initial render would differ between server (always false) and client
 * (the real value, available immediately since `window` exists), causing a
 * hydration mismatch. The one extra client-only render this costs is the
 * correct tradeoff for a value that fundamentally cannot be known during
 * SSR.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe media query read, see doc comment above
    setReduced(query.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

/**
 * True only on devices with a mouse-like pointer — gates cursor-follow and
 * magnetic effects. Same SSR-safety rationale as useReducedMotion above.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe media query read, see doc comment above
    setFine(query.matches);
    const listener = (e: MediaQueryListEvent) => setFine(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return fine;
}
