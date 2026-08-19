// Brief §13 — the strong editorial statement section right after the hero.
// Asymmetric two-column: a large serif statement + supporting copy against
// INTRO_IMAGE. This is the breathing-room beat between the dense hero and
// the menu that follows, so padding stays generous (brief §37).

import Image from "next/image";
import { INTRO_IMAGE } from "@/lib/images";
import { Reveal } from "@/components/ui/Reveal";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function IntroSection() {
  return (
    <section
      aria-labelledby="intro-heading"
      className="bg-offwhite py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-10 lg:grid-cols-[55fr_45fr] lg:gap-20">
        <ImageReveal className="relative order-1 aspect-[4/5] w-full rounded-sm lg:order-2">
          <Image
            src={INTRO_IMAGE.src}
            alt={INTRO_IMAGE.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="h-full w-full object-cover"
          />
        </ImageReveal>

        <Reveal as="div" className="order-2 lg:order-1">
          <SectionLabel tone="copper" className="mb-5">
            The Copper Larder
          </SectionLabel>
          <h2
            id="intro-heading"
            className="font-serif text-4xl leading-[1.1] text-charcoal sm:text-5xl lg:text-[3.25rem]"
          >
            Proper British cooking, without the fuss.
          </h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-charcoal/70 sm:text-lg">
            We cook what the season hands us — good meat from farms we know
            by name, veg pulled that morning, nothing dressed up to look
            like something it isn&rsquo;t. It&rsquo;s the kind of food this
            city grew up on, done properly and put down in front of you
            without ceremony.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
