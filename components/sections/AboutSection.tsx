// About section (brief §17) — "A Small Kitchen. A Simple Idea."
// A premium, unhurried editorial story beat: the brief's About copy split
// into cascading fragments alongside an asymmetric three-image composition
// built from ABOUT_IMAGES. No interactivity of its own, so this stays a
// Server Component — Reveal / ImageReveal own their own "use client" motion.

import Image from "next/image";
import { ABOUT_IMAGES } from "@/lib/images";
import { Reveal } from "@/components/ui/Reveal";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-offwhite px-6 py-28 md:py-36 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header beat: label + heading, and the feature statement as its
            own larger, distinct pull alongside it. */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal as="div" className="max-w-xl">
            <SectionLabel tone="copper">THE SHORT VERSION</SectionLabel>
            <h2
              id="about-heading"
              className="mt-4 font-serif text-4xl leading-[1.08] text-charcoal sm:text-5xl"
            >
              A Small Kitchen. A Simple Idea.
            </h2>
          </Reveal>

          <Reveal as="div" delay={0.12} className="max-w-md lg:text-right">
            <p className="font-serif text-3xl leading-[1.2] text-brown sm:text-[2.25rem]">
              Good food doesn&rsquo;t need to shout.
            </p>
          </Reveal>
        </div>

        {/* Asymmetric editorial grid: images and text fragments offset
            against one another rather than a repeating three-up row. */}
        <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 md:mt-28 lg:grid-cols-12 lg:gap-y-24">
          {/* Image 1 — copper pendant lights, tall, sits up the left rail */}
          <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <ImageReveal className="relative aspect-[4/5] lg:mt-14">
              <Image
                src={ABOUT_IMAGES[0].src}
                alt={ABOUT_IMAGES[0].alt}
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </ImageReveal>
          </div>

          {/* Fragment 1 */}
          <div className="flex items-center lg:col-span-6 lg:col-start-7 lg:row-start-1">
            <Reveal delay={0.05}>
              <p className="text-lg leading-relaxed text-charcoal-soft sm:text-xl">
                We opened on Brindley Place with a simple idea: modern British
                food doesn&rsquo;t need to shout to be worth a look. Good
                bread, honest butchery, veg from growers we actually know by
                name — that&rsquo;s most of the job done before anyone picks
                up a pan.
              </p>
            </Reveal>
          </div>

          {/* Image 2 — reclaimed oak table, wide, offset toward centre */}
          <div className="lg:col-span-6 lg:col-start-2 lg:row-start-2">
            <ImageReveal delay={0.08} className="relative aspect-[16/10]">
              <Image
                src={ABOUT_IMAGES[1].src}
                alt={ABOUT_IMAGES[1].alt}
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            </ImageReveal>
          </div>

          {/* Fragment 2 */}
          <div className="flex items-center lg:col-span-4 lg:col-start-9 lg:row-start-2">
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-charcoal-soft sm:text-xl">
                The dining room sits low and warm against the canal, copper
                pendant lights over reclaimed oak tables, the pass in full
                view so you can watch the chaos turn into supper. It&rsquo;s
                unfussy on purpose — somewhere for a first date, a Tuesday
                catch-up, or a proper Sunday roast that runs long.
              </p>
            </Reveal>
          </div>

          {/* Fragment 3 */}
          <div className="flex items-center lg:col-span-5 lg:col-start-1 lg:row-start-3">
            <Reveal delay={0.15}>
              <p className="text-lg leading-relaxed text-charcoal-soft sm:text-xl">
                We&rsquo;re a small kitchen, which means the menu moves with
                the seasons rather than a marketing calendar. Ask what&rsquo;s
                good today — we&rsquo;ll tell you straight.
              </p>
            </Reveal>
          </div>

          {/* Image 3 — the pass / kitchen, small, offset to the right */}
          <div className="lg:col-span-5 lg:col-start-7 lg:row-start-3">
            <ImageReveal delay={0.18} className="relative ml-auto aspect-square max-w-sm lg:mt-10">
              <Image
                src={ABOUT_IMAGES[2].src}
                alt={ABOUT_IMAGES[2].alt}
                fill
                sizes="(min-width: 1024px) 28vw, 80vw"
                className="object-cover"
              />
            </ImageReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
