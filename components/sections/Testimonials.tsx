"use client";

// Kind Words (brief §19). A dark, restrained testimonial presentation —
// one large serif quote at a time rather than a three-card grid. Paging
// is manual (arrows + dots), with a "01 / 03" style counter. The swap
// between quotes crossfades with a slight vertical drift (brief's own
// suggested transition), built as a small GSAP timeline and gated on
// useReducedMotion() — reduced motion swaps content instantly with no
// animation at all. Fully keyboard-operable regardless of motion state.

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

type Testimonial = {
  quote: string;
  name: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The braised feather blade nearly had me asking for the recipe out loud. Proper, unhurried, and the room's lovely at dusk.",
    name: "Priya M.",
  },
  {
    quote:
      "Took my dad for his birthday and he's still on about the Sunday roast a month later. Worth the wait for a table.",
    name: "Callum R.",
  },
  {
    quote:
      "Small menu, no weak links. The wild mushroom toast alone is worth the trip down to Brindley Place.",
    name: "Esther A.",
  },
];

const PAD = (n: number) => String(n).padStart(2, "0");

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reducedMotion = useReducedMotion();
  const quoteRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  const total = TESTIMONIALS.length;

  const goTo = (next: number, dir: 1 | -1) => {
    setDirection(dir);
    setIndex(((next % total) + total) % total);
  };

  const handlePrev = () => goTo(index - 1, -1);
  const handleNext = () => goTo(index + 1, 1);

  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: direction === 1 ? 18 : -18 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );
    });

    return () => ctx.revert();
    // direction intentionally excluded — only the index change should retrigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reducedMotion]);

  const current = TESTIMONIALS[index];

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden bg-charcoal py-24 sm:py-32"
    >
      <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
        <Reveal as="div" className="flex flex-col items-center">
          <SectionLabel tone="cream">Kind Words</SectionLabel>
          <h2
            id="testimonials-heading"
            className="font-serif mt-5 text-5xl text-cream sm:text-6xl"
          >
            What People Say
          </h2>
        </Reveal>

        <Reveal delay={0.12} distance={28} className="mt-16 sm:mt-20">
          <div
            className="min-h-[260px] sm:min-h-[220px]"
            role="group"
            aria-roledescription="carousel"
            aria-label="Guest testimonials"
          >
            <div
              key={index}
              ref={quoteRef}
              aria-live="polite"
              style={reducedMotion ? undefined : { opacity: 0 }}
            >
              <blockquote>
                <p className="font-serif text-3xl leading-[1.3] text-cream sm:text-4xl lg:text-[2.75rem] lg:leading-[1.28]">
                  &ldquo;{current.quote}&rdquo;
                </p>
                <footer className="mt-8">
                  <cite className="text-xs font-medium not-italic uppercase tracking-[0.24em] text-copper">
                    {current.name}
                  </cite>
                </footer>
              </blockquote>
            </div>
          </div>

          {/* Controls: pagination counter, arrows, and dots */}
          <div className="mt-14 flex flex-col items-center gap-6 sm:mt-16">
            <div className="flex items-center gap-6 sm:gap-8">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition-colors duration-300 hover:border-copper hover:text-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M10 13L5 8L10 3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <p className="text-xs font-medium uppercase tracking-[0.24em] text-cream/50">
                <span className="text-cream">{PAD(index + 1)}</span>
                {" / "}
                {PAD(total)}
              </p>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition-colors duration-300 hover:border-copper hover:text-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  aria-label={`Show testimonial from ${t.name}`}
                  aria-current={i === index ? "true" : undefined}
                  className="group flex h-6 w-6 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
                >
                  <span
                    className={`block h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      i === index
                        ? "scale-125 bg-copper"
                        : "bg-cream/30 group-hover:bg-cream/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
