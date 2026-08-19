"use client";

// The cinematic hero — full-bleed photo, vertically centered editorial
// content matching the approved reference composition, and a single GSAP
// entrance timeline that runs once on mount. This is above the fold, so it
// is deliberately NOT scroll-triggered: no Reveal/ImageReveal here, just a
// dedicated timeline built from refs on the elements below. Under reduced
// motion the whole effect is skipped and every element renders in its
// settled, fully visible state immediately.
//
// Content hierarchy follows the reference exactly: the tagline is the
// dominant hero statement (large serif, centered, with the flame/sprig
// flourish inline), not the restaurant name — the name only needs to carry
// as a small signature line here since it's already the wordmark in the
// (untouched) navbar. Centered rather than bottom-pinned so the negative
// space reads as intentional on any viewport, and the tagline is capped
// with a vh-aware min() so it can never push the address/buttons/trust row
// off the bottom edge on a short window.

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { RESTAURANT } from "@/lib/restaurant";
import { scrollToSection } from "@/lib/scrollTo";
import { openBookingChat } from "@/lib/openChat";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeroBackground } from "./HeroBackground";
import { ScrollIndicator } from "./ScrollIndicator";

// BBQ grill + flame + rosemary sprig flourish, matching the reference
// mockup's centre ornament — sits between the two flanking halves of the
// tagline, echoing "a bit of fire" without being a literal food photo.
function FireSprigOrnament() {
  return (
    <svg
      viewBox="0 0 44 40"
      width="72"
      height="65"
      fill="none"
      aria-hidden="true"
      className="inline-block shrink-0 align-middle text-copper-light"
    >
      {/* grill bowl */}
      <path
        d="M8 22.5c0 5 6.3 8.5 14 8.5s14-3.5 14-8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M8 22.5h28" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      {/* crossed legs */}
      <path
        d="M13 24.5 9 37M31 24.5l4 12.5M17 24.5l-3 12.5M27 24.5l3 12.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* flame rising from the grill */}
      <path
        d="M21 21c-3-3-4-6.5-2-10.5.4 2 1.6 2.8 2.6 1.8.6 3 2.4 4 3.8 2.4.4 2.6-.6 4.4-2.4 5.6-.6.4-1.2.7-2 .7Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* rosemary sprig */}
      <path
        d="M27 18c3.5-3 6.5-5 10-6.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M29.5 16.2l2-2.4M32 14l2-2.6M34.5 11.8l2-2.4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

// A short dashed connector before each trust pillar — the small
// dot-then-line mark from the reference's stat row, reused three times.
function PillarMark() {
  return (
    <span className="mr-2 inline-flex items-center gap-1.5 align-middle" aria-hidden="true">
      <span className="h-1 w-1 rounded-full bg-copper-light" />
      <span className="h-px w-5 border-t border-dashed border-cream/35" />
    </span>
  );
}

export function Hero() {
  const reducedMotion = useReducedMotion();

  const bgWrapperRef = useRef<HTMLDivElement | null>(null);
  const bgImageRef = useRef<HTMLDivElement | null>(null);
  const wordmarkRef = useRef<HTMLDivElement | null>(null);
  const taglineRef = useRef<HTMLHeadingElement | null>(null);
  const locationRef = useRef<HTMLParagraphElement | null>(null);
  const ctaPrimaryRef = useRef<HTMLDivElement | null>(null);
  const ctaSecondaryRef = useRef<HTMLDivElement | null>(null);
  const pillarsRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(bgWrapperRef.current, { opacity: 0 }, { opacity: 1, duration: 1.3, ease: "power2.out" }, 0)
        .fromTo(bgImageRef.current, { scale: 1.08 }, { scale: 1, duration: 1.9, ease: "power2.out" }, 0)
        .fromTo(wordmarkRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.5)
        .fromTo(taglineRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, 0.68)
        .fromTo(locationRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 1.25)
        .fromTo(
          [ctaPrimaryRef.current, ctaSecondaryRef.current],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
          1.4,
        )
        .fromTo(pillarsRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 1.7)
        .fromTo(scrollIndicatorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.1);
    });

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  const hiddenStyle = reducedMotion ? undefined : { opacity: 0 };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex h-dvh min-h-[560px] w-full flex-col items-stretch justify-center overflow-hidden bg-charcoal pt-16 sm:pt-20"
    >
      <HeroBackground wrapperRef={bgWrapperRef} imageRef={bgImageRef} />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center sm:px-10">
        <div ref={wordmarkRef} style={hiddenStyle}>
          <p className="font-serif text-[13px] uppercase tracking-[0.32em] text-cream/70 sm:text-sm">
            {RESTAURANT.name}
          </p>
        </div>

        <h1
          id="hero-heading"
          ref={taglineRef}
          className="mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-3 font-serif text-cream text-[min(8vw,6.5vh)] leading-[1.18] sm:gap-x-5 sm:text-[min(5.6vw,6vh)] md:text-[min(4vw,5.5vh)] lg:text-[min(3.1vw,5vh)]"
        >
          <span className="max-w-[20ch] text-right">Proper British cooking, done with a bit of care,</span>
          <FireSprigOrnament />
          <span className="max-w-[17ch] text-left">a bit of fire, and no fuss about it.</span>
        </h1>

        <p
          ref={locationRef}
          style={hiddenStyle}
          className="mt-6 text-[13px] uppercase tracking-[0.16em] text-cream/55 sm:mt-7"
        >
          {RESTAURANT.address}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4 sm:mt-10">
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

        <div
          ref={pillarsRef}
          style={hiddenStyle}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-6 text-[10.5px] uppercase tracking-[0.14em] text-cream/55 sm:mt-8"
        >
          <span>
            <PillarMark />
            Seasonal Menu
          </span>
          <span>
            <PillarMark />
            Local Farms &amp; Growers
          </span>
          <span>
            <PillarMark />
            Sunday Roast Weekly
          </span>
        </div>
      </div>

      <ScrollIndicator wrapperRef={scrollIndicatorRef} />
    </section>
  );
}
