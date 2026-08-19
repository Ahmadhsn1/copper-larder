"use client";

// The Signature — Braised Feather Blade of Beef (brief §16). A visually
// dominant, dark-mood feature section: a tall cinematic image carries the
// section, with a restrained editorial text column beside it. The image
// drifts a few dozen pixels against the text on scroll (GSAP ScrollTrigger,
// scrub: true) — a subtle parallax, never a dramatic one — and is skipped
// entirely for prefers-reduced-motion, where the image simply sits still.

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MENU } from "@/lib/restaurant";
import { SIGNATURE_DISH_IMAGE } from "@/lib/images";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

const FEATHER_BLADE = MENU.find((section) => section.id === "mains")?.items.find(
  (item) => item.name === "Braised Feather Blade of Beef",
);

// "6hr, red wine" -> "6HR · RED WINE" — derived from the menu data itself
// (not hand-typed) so the meta line can never drift from the source of truth.
const META_LINE = FEATHER_BLADE?.description
  .split(",")
  .map((part) => part.trim().toUpperCase())
  .join(" · ");

export function SignatureDish() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const parallax = parallaxRef.current;
    if (!section || !parallax || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        parallax,
        { y: -36 },
        {
          y: 36,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="signature-dish-heading"
      className="relative overflow-hidden bg-charcoal"
    >
      <div className="mx-auto flex max-w-[1800px] flex-col md:flex-row md:items-stretch">
        {/* Dominant image column */}
        <div className="order-1 w-full md:w-[62%] lg:w-[66%]">
          <ImageReveal className="relative h-[62vh] w-full sm:h-[72vh] md:h-[88vh]">
            <div
              ref={parallaxRef}
              className="absolute inset-x-0 -top-10 -bottom-10"
            >
              <Image
                src={SIGNATURE_DISH_IMAGE.src}
                alt={SIGNATURE_DISH_IMAGE.alt}
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover"
                priority={false}
              />
            </div>
          </ImageReveal>
        </div>

        {/* Editorial text column */}
        <div className="order-2 flex w-full flex-col justify-center px-6 py-16 sm:px-10 md:w-[38%] md:px-12 md:py-0 lg:w-[34%] lg:px-16">
          <Reveal>
            <SectionLabel tone="copper">The Signature</SectionLabel>
          </Reveal>

          <Reveal delay={0.1} distance={28}>
            <h2
              id="signature-dish-heading"
              className="font-serif mt-5 text-6xl uppercase leading-[0.92] text-cream sm:text-7xl lg:text-8xl"
            >
              Braised
              <br />
              Feather Blade
            </h2>
          </Reveal>

          <Reveal delay={0.2} distance={24}>
            <p className="mt-7 text-xs font-medium uppercase tracking-[0.24em] text-cream/50">
              {META_LINE}
            </p>
          </Reveal>

          <Reveal delay={0.28} distance={24}>
            <p className="font-serif mt-6 text-4xl text-copper">{FEATHER_BLADE?.price}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
