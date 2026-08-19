"use client";

// The cinematic hero — full-bleed photo, vertically centered editorial
// content, and a single GSAP entrance timeline that runs once on mount
// (brief §10). This is above the fold, so it is deliberately NOT
// scroll-triggered: no Reveal/ImageReveal here, just a dedicated timeline
// built from refs on the elements below. Under reduced motion the whole
// effect is skipped and every element renders in its settled, fully
// visible state immediately.
//
// Centered rather than bottom-pinned: bottom-anchoring reads as a large
// dead void above the text on anything taller than a phone, and on short
// windows it can push content up under the fixed navbar or off the bottom
// edge entirely. Centering distributes the negative space evenly (reads as
// intentional, not empty) and keeps the same safety margin on both edges.
// The heading is additionally capped with a vh-aware min() so three stacked
// lines can never consume more than roughly a third of the viewport's
// height, however short the window gets.

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
      className="relative flex h-dvh min-h-[560px] w-full flex-col items-stretch justify-center overflow-hidden bg-charcoal pt-16 sm:pt-20"
    >
      <HeroBackground wrapperRef={bgWrapperRef} imageRef={bgImageRef} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10">
        <div ref={eyebrowRef} style={hiddenStyle}>
          <span className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-cream/90 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper-light opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-copper-light" />
            </span>
            Modern British Bistro
          </span>
        </div>

        <h1
          id="hero-heading"
          className="mt-5 font-serif uppercase leading-[0.86] tracking-tight text-cream text-[min(17vw,15vh)] sm:text-[min(14vw,14vh)] md:text-[min(10.5vw,13vh)] lg:text-[min(8.5vw,12vh)] xl:text-[min(128px,12vh)]"
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

        <div className="mt-10 flex flex-wrap items-center gap-4 pb-8 sm:mt-12">
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
