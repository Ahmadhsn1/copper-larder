import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Smooth-scrolls to a section, routing through the active Lenis instance
 * (see components/motion/SmoothScroll.tsx) when one exists, falling back
 * to native scrollIntoView when Lenis is disabled (reduced motion / touch).
 */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  if (window.__lenis) {
    window.__lenis.scrollTo(target, { offset: -88 });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
