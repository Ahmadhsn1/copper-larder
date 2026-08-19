export function About() {
  return (
    <section id="about" className="border-t border-border px-6 py-24 sm:px-10 md:py-32">
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[minmax(0,220px)_1fr] md:gap-16">
        <div className="reveal">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-accent-2">
            The short version
          </p>
          <h2 className="font-serif text-4xl text-ink sm:text-5xl">About us</h2>
        </div>

        <div className="reveal flex flex-col gap-6 text-base leading-relaxed text-ink/85 sm:text-lg" style={{ animationDelay: "80ms" }}>
          <p>
            We opened on Brindley Place with a simple idea: modern British food doesn&rsquo;t need to
            shout to be worth a look. Good bread, honest butchery, veg from growers we actually know
            by name &mdash; that&rsquo;s most of the job done before anyone picks up a pan.
          </p>
          <p>
            The dining room sits low and warm against the canal, copper pendant lights over reclaimed
            oak tables, the pass in full view so you can watch the chaos turn into supper. It&rsquo;s
            unfussy on purpose &mdash; somewhere for a first date, a Tuesday catch-up, or a proper
            Sunday roast that runs long.
          </p>
          <p>
            We&rsquo;re a small kitchen, which means the menu moves with the seasons rather than a
            marketing calendar. Ask what&rsquo;s good today &mdash; we&rsquo;ll tell you straight.
          </p>
        </div>
      </div>
    </section>
  );
}
