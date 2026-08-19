"use client";

// Immersive restaurant-atmosphere gallery (brief §18).
//
// Desktop, fine pointer, motion allowed: vertical scroll drives a pinned
// horizontal track through all 8 GALLERY_IMAGES (classic GSAP ScrollTrigger
// pin + scrub recipe). Everyone else — touch devices at any width (including
// a touch laptop at desktop widths), coarse/no pointer, and anyone who has
// asked for reduced motion — gets a plain CSS scroll-snap row with zero JS
// animation. The two variants share one DOM structure; only the surrounding
// classes and the presence of a GSAP timeline differ, so there is nothing to
// keep in sync by hand and no motion ever runs for a reduced-motion visitor.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion, useFinePointer } from "@/lib/useReducedMotion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RESTAURANT } from "@/lib/restaurant";
import { GALLERY_IMAGES } from "@/lib/images";

gsap.registerPlugin(ScrollTrigger);

const HEADING_ID = "gallery-heading";

function getIsWide(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 1024px)").matches;
}

export function GallerySection() {
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const [isWide, setIsWide] = useState(getIsWide);

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Pure width tracking — pointer type and motion preference already come
  // from the shared hooks above. Mirrors the lazy-init + listener pattern
  // in lib/useReducedMotion.ts so there's no setState-in-effect-body.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const listener = (e: MediaQueryListEvent) => setIsWide(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const scrollJack = isWide && finePointer && !reducedMotion;

  useEffect(() => {
    if (!scrollJack) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - section.clientWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${track.scrollWidth - section.clientWidth}`,
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progress) progress.style.width = `${self.progress * 100}%`;
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, [scrollJack]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby={HEADING_ID}
      className={
        scrollJack
          ? "relative h-screen overflow-hidden bg-charcoal"
          : "relative overflow-hidden bg-charcoal py-24 md:py-32"
      }
    >
      <div
        className={
          scrollJack
            ? "absolute inset-x-0 top-0 z-10 px-6 pt-16 md:px-10"
            : "px-6 md:px-10"
        }
      >
        <Reveal>
          <SectionLabel tone="copper">The Room</SectionLabel>
          <h2
            id={HEADING_ID}
            className="mt-3 max-w-xl font-serif text-4xl leading-[1.05] text-cream md:text-5xl"
          >
            Inside {RESTAURANT.name}
          </h2>
        </Reveal>
      </div>

      <div
        ref={trackRef}
        className={
          scrollJack
            ? "flex h-full items-center gap-6 pl-[8vw] pr-[8vw] pt-8 will-change-transform"
            : "flex gap-5 overflow-x-auto scroll-px-6 snap-x snap-mandatory px-6 pb-2 pt-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6 md:px-10"
        }
      >
        {GALLERY_IMAGES.map((image, i) => (
          <div
            key={image.src}
            className={
              scrollJack
                ? "relative aspect-[4/5] w-[26vw] min-w-[320px] max-w-[420px] shrink-0 overflow-hidden bg-charcoal-soft"
                : "relative aspect-[4/5] w-[78vw] max-w-[380px] shrink-0 snap-start overflow-hidden bg-charcoal-soft"
            }
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={
                scrollJack
                  ? "(min-width: 1024px) 30vw, 80vw"
                  : "(min-width: 768px) 380px, 78vw"
              }
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {scrollJack && (
        <div className="absolute bottom-10 left-[8vw] right-[8vw] h-px bg-cream/15">
          <div
            ref={progressRef}
            className="h-full w-0 bg-copper transition-[width] duration-100 ease-out"
          />
        </div>
      )}
    </section>
  );
}
