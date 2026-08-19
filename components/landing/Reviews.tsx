type Review = {
  quote: string;
  attribution: string;
};

const REVIEWS: Review[] = [
  {
    quote:
      "The braised feather blade nearly had me asking for the recipe out loud. Proper, unhurried, and the room's lovely at dusk.",
    attribution: "Priya M.",
  },
  {
    quote:
      "Took my dad for his birthday and he's still on about the Sunday roast a month later. Worth the wait for a table.",
    attribution: "Callum R.",
  },
  {
    quote:
      "Small menu, no weak links. The wild mushroom toast alone is worth the trip down to Brindley Place.",
    attribution: "Esther A.",
  },
];

export function Reviews() {
  return (
    <section id="reviews" className="border-t border-border bg-surface px-6 py-24 sm:px-10 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="reveal mb-14 max-w-xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-accent-2">
            Kind words
          </p>
          <h2 className="font-serif text-4xl text-ink sm:text-5xl">What people say</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <figure
              key={review.attribution}
              className="reveal flex h-full flex-col justify-between rounded-2xl border border-border bg-bg px-6 py-7 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.06)]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <blockquote className="font-serif text-lg leading-snug text-ink sm:text-xl">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm text-muted">{review.attribution}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
