"use client";

// Sunday Roast — a dedicated, cozy, conversion-focused feature (brief §20).
// Distinctly warmer and more intimate than the main Menu / Signature Dish
// sections: a tighter, portrait-cropped image sits framed beside a compact
// editorial text column on a soft warm-tinted ground, rather than the
// full-bleed cinematic treatment used elsewhere on the page.

import Image from "next/image";
import { SUNDAY_ROAST } from "@/lib/restaurant";
import { SUNDAY_ROAST_IMAGE } from "@/lib/images";
import { openBookingChat } from "@/lib/openChat";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MagneticButton } from "@/components/ui/MagneticButton";

const SERVED_LINE = `Served ${SUNDAY_ROAST.hours}`.toUpperCase();
const NOTE_LINE = SUNDAY_ROAST.note.toUpperCase();

export function SundayRoast() {
  return (
    <section aria-labelledby="sunday-roast-heading" className="relative overflow-hidden bg-cream">
      {/* Soft warm glow — the one deliberately "cozier" cue that separates this
          section's ground from the surrounding light sections. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_18%_30%,rgba(166,106,67,0.14),transparent_60%)]"
      />

      <div className="relative mx-auto grid max-w-[1300px] items-center gap-14 px-6 py-24 sm:px-10 sm:py-32 lg:grid-cols-12 lg:gap-10 lg:px-16 lg:py-36">
        {/* Framed, intimate portrait image */}
        <div className="lg:col-span-6 lg:col-start-1">
          <ImageReveal className="relative mx-auto aspect-[4/5] w-full max-w-[440px] shadow-[0_30px_60px_-25px_rgba(23,22,19,0.35)] sm:max-w-[520px] lg:max-w-none">
            <div className="relative h-full w-full">
              <Image
                src={SUNDAY_ROAST_IMAGE.src}
                alt={SUNDAY_ROAST_IMAGE.alt}
                fill
                sizes="(min-width: 1024px) 45vw, (min-width: 640px) 60vw, 90vw"
                className="object-cover"
              />
            </div>
          </ImageReveal>
        </div>

        {/* Editorial text column */}
        <div className="flex flex-col items-start lg:col-span-5 lg:col-start-8">
          <Reveal>
            <SectionLabel tone="copper">A Larder Tradition</SectionLabel>
          </Reveal>

          <Reveal delay={0.1} distance={28}>
            <h2
              id="sunday-roast-heading"
              className="font-serif mt-5 text-6xl leading-[0.95] text-charcoal sm:text-7xl lg:text-8xl"
            >
              Sunday Roast
            </h2>
          </Reveal>

          <Reveal delay={0.2} distance={24}>
            <p className="font-serif mt-7 text-4xl text-copper">{SUNDAY_ROAST.price}</p>
          </Reveal>

          <Reveal delay={0.28} distance={20}>
            <div className="mt-6 flex flex-col gap-2 text-xs font-medium uppercase tracking-[0.24em] text-brown">
              <p>{SERVED_LINE}</p>
              <p>{NOTE_LINE}</p>
            </div>
          </Reveal>

          <Reveal delay={0.36} distance={20}>
            <p className="mt-8 max-w-sm font-serif text-xl leading-relaxed text-charcoal/80">
              Slow-roasted, unhurried, and gone by five — the way a Sunday
              table should be.
            </p>
          </Reveal>

          <Reveal delay={0.44} distance={16}>
            <MagneticButton
              as="button"
              onClick={openBookingChat}
              className="mt-10 inline-flex items-center justify-center bg-copper px-9 py-4 text-xs font-medium uppercase tracking-[0.24em] text-cream transition-colors duration-300 hover:bg-brown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              Book Sunday Roast
            </MagneticButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
