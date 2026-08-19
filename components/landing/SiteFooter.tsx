import { HOURS_TEXT, RESTAURANT } from "@/lib/restaurant";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-16 sm:px-10">
      <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl text-ink">{RESTAURANT.name}</p>
          <p className="mt-2 text-sm text-muted">{RESTAURANT.type}</p>
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted">Visit</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/85">{RESTAURANT.address}</p>
          <a
            href={RESTAURANT.phoneHref}
            className="mt-1 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-hover"
          >
            {RESTAURANT.phone}
          </a>
          <p className="mt-2 text-sm leading-relaxed text-muted">{RESTAURANT.parking}</p>
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-muted">Hours</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/85">{HOURS_TEXT}</p>
          <p className="mt-2 text-sm text-muted">{RESTAURANT.pricePoint}</p>
        </div>
      </div>

      <p className="mx-auto mt-14 max-w-4xl border-t border-border pt-8 text-xs text-muted">
        &copy; {new Date().getFullYear()} {RESTAURANT.name}. A demo built to show off a rather good chat widget.
      </p>
    </footer>
  );
}
