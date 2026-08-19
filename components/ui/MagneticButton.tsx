"use client";

// A subtle pointer-pull on primary CTAs (brief §26) — the button leans
// slightly toward the cursor while hovered, using gsap.quickTo for buttery
// interpolation. Desktop-with-mouse only; a no-op everywhere else (touch,
// reduced motion), so it never fights with tap interactions.

import { useEffect, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import gsap from "gsap";
import { useFinePointer, useReducedMotion } from "@/lib/useReducedMotion";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
} & (
  | ({ as: "a" } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ as?: "button" } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export function MagneticButton({ children, className = "", strength = 0.35, as, ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer || reducedMotion) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    }

    function handleLeave() {
      xTo(0);
      yTo(0);
    }

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [finePointer, reducedMotion, strength]);

  if (as === "a") {
    return (
      <a ref={ref} className={className} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button ref={ref} className={className} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
