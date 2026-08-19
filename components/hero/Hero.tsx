"use client";

// The cinematic hero — full-bleed photo, bottom-anchored editorial content,
// and a single GSAP entrance timeline that runs once on mount (brief §10).
// This is above the fold, so it is deliberately NOT scroll-triggered: no
// Reveal/ImageReveal here, just a dedicated timeline built from refs on the
// elements below. Under reduced motion the whole effect is skipped and
// every element renders in its settled, fully visible state immediately.

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { RESTAURANT } from "@/lib/restaurant";
import { scrollToSection } from "@/lib/scrollTo";
import { openBookingChat } from "@/lib/openChat";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeroBackground } from "./HeroBackground";
import { ScrollIndicator } from "./ScrollIndicator";

export function Hero() {
  const reducedMotion = useReducedMotion();

  const bgWrapperRef = useRef<HTMLDivElement | null>(null);
  const bgImageRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const line3Ref = useRef<HTMLSpanElement | null>(null);
  const supportRef = useRef<HTMLParagraphElement | null>(null);
  const locationRef = useRef<HTMLParagraphElement | null>(null);
  const ctaPrimaryRef = useRef<HTMLDivElement | null>(null);
  const ctaSecondaryRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(bgWrapperRef.current, { opacity: 0 }, { opacity: 1, duration: 1.3, ease: "power2.out" }, 0)
        .fromTo(bgImageRef.current, { scale: 1.08 }, { scale: 1, duration: 1.9, ease: "power2.out" }, 0)
        .fromTo(eyebrowRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.55)
        .fromTo(
          [line1Ref.current, line2Ref.current, line3Ref.current],
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.12 },
          0.72,
        )
        .fromTo(supportRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 1.25)
        .fromTo(locationRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 1.4)
        .fromTo(
          [ctaPrimaryRef.current, ctaSecondaryRef.current],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
          1.55,
        )
        .fromTo(scrollIndicatorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.15);
    });

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  const hiddenStyle = reducedMotion ? undefined : { opacity: 0 };
  const hiddenLineStyle = reducedMotion ? undefined : { opacity: 0, transform: "translateY(100%)" };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex h-dvh min-h-[640px] w-full flex-col overflow-hidden bg-charcoal pt-28 sm:pt-32"
    >
      <HeroBackground wrapperRef={bgWrapperRef} imageRef={bgImageRef} />

      {/* Absorbs slack so the content block below stays bottom-anchored in
          the common case, but can never push the eyebrow above the pt-28/32
          safe zone reserved for the floating navbar — unlike justify-end,
          a shrink-to-zero spacer can't force content to overflow upward
          past the section's top on short viewports. */}
      <div className="min-h-0 flex-1" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl shrink-0 px-6 pb-16 sm:px-10 sm:pb-20 md:pb-24">
        <div ref={eyebrowRef} style={hiddenStyle}>
          <span className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-cream/90 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-copper-light" aria-hidden="true" />
            Modern British Bistro
          </span>
        </div>

        <h1
          id="hero-heading"
          className="mt-5 font-serif uppercase leading-[0.86] tracking-tight text-cream text-[17vw] sm:text-[14vw] md:text-[10.5vw] lg:text-[8.5vw] xl:text-[128px]"
        >
          <span className="block overflow-hidden">
            <span ref={line1Ref} className="block" style={hiddenLineStyle}>
              The
            </span>
          </span>
          <span className="block overflow-hidden">
            <span ref={line2Ref} className="block" style={hiddenLineStyle}>
              Copper
            </span>
          </span>
          <span className="block overflow-hidden">
            <span ref={line3Ref} className="block" style={hiddenLineStyle}>
              Larder
            </span>
          </span>
        </h1>

        <div className="mt-8 max-w-xl sm:mt-10">
          <p ref={supportRef} style={hiddenStyle} className="text-lg leading-relaxed text-cream/85 sm:text-xl">
            Proper British cooking, done with a bit of care, a bit of fire, and no fuss about it.
          </p>
          <p
            ref={locationRef}
            style={hiddenStyle}
            className="mt-4 text-[13px] uppercase tracking-[0.16em] text-cream/55"
          >
            {RESTAURANT.address}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 sm:mt-12">
          <div ref={ctaPrimaryRef} style={hiddenStyle}>
            <MagneticButton
              onClick={openBookingChat}
              className="inline-flex items-center justify-center rounded-sm bg-copper px-9 py-4 text-[13px] font-medium uppercase tracking-[0.16em] text-cream transition-colors duration-300 hover:bg-copper-light"
            >
              Book a Table
            </MagneticButton>
          </div>
          <div ref={ctaSecondaryRef} style={hiddenStyle}>
            <MagneticButton
              onClick={() => scrollToSection("menu")}
              className="inline-flex items-center justify-center rounded-sm border border-cream/50 px-9 py-4 text-[13px] font-medium uppercase tracking-[0.16em] text-cream transition-colors duration-300 hover:border-cream hover:bg-cream/10"
            >
              View the Menu
            </MagneticButton>
          </div>
        </div>
      </div>

      <ScrollIndicator wrapperRef={scrollIndicatorRef} />
    </section>
  );
}
