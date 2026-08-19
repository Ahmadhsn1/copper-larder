import { HOURS_TEXT, RESTAURANT } from "@/lib/restaurant";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border px-6 pb-20 pt-24 sm:px-10 sm:pb-28 sm:pt-32 md:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/[0.06] blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent-2/[0.05] blur-3xl"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-start">
        <p className="animate-fade-up mb-5 text-sm font-medium uppercase tracking-[0.18em] text-accent">
          {RESTAURANT.type} &middot; Brindley Place, Birmingham
        </p>

        <h1
          className="animate-fade-up font-serif text-[13vw] leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ animationDelay: "80ms" }}
        >
          The Copper
          <br />
          Larder
        </h1>

        <p
          className="animate-fade-up mt-7 max-w-xl text-lg leading-relaxed text-ink/80 sm:text-xl"
          style={{ animationDelay: "160ms" }}
        >
          Proper British cooking, done with a bit of care, a bit of fire, and no fuss about it.
          Pull up a chair by the canal &mdash; you&rsquo;ll be glad you did.
        </p>

        <p
          className="animate-fade-up mt-6 text-sm text-muted sm:text-base"
          style={{ animationDelay: "220ms" }}
        >
          {RESTAURANT.address} &middot; {HOURS_TEXT}
        </p>

        <a
          href="#menu"
          className="animate-fade-up mt-10 inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-medium text-white transition-colors hover:bg-accent-hover"
          style={{ animationDelay: "280ms" }}
        >
          See the menu
        </a>
      </div>
    </section>
  );
}
