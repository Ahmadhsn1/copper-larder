// Visit (brief §21/22) — the location/contact section. Contact details
// column (address, phone, hours, parking) alongside a real embedded map.
// No onClick handlers of its own — MagneticButton and Reveal own their own
// client-side needs — so this stays a Server Component.

import { HOURS, RESTAURANT } from "@/lib/restaurant";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MapSection } from "@/components/sections/MapSection";

// Groups HOURS (keyed by Date#getDay(), 0=Sun..6=Sat) into display rows,
// merging consecutive days that share identical open/close values so the
// on-page text can never drift from lib/restaurant.ts's actual data.
// Walk order starts Tuesday and wraps through Monday last, so the single
// closed day settles at the end of the list rather than splitting an
// open run at the Sun/Mon week boundary — TUE–THU / FRI–SAT / SUN / MON.
type DayHours = (typeof HOURS)[number];

const WEEK_ORDER = [2, 3, 4, 5, 6, 0, 1] as const;
const DAY_ABBR: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

function sameHours(a: DayHours, b: DayHours): boolean {
  if (a === null || b === null) return a === b;
  return a.open === b.open && a.close === b.close;
}

function groupHours(hours: typeof HOURS): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  let i = 0;

  while (i < WEEK_ORDER.length) {
    const startDay = WEEK_ORDER[i];
    const startHours = hours[startDay];

    let j = i;
    while (j + 1 < WEEK_ORDER.length && sameHours(hours[WEEK_ORDER[j + 1]], startHours)) {
      j++;
    }

    const endDay = WEEK_ORDER[j];
    const label =
      startDay === endDay
        ? DAY_ABBR[startDay].toUpperCase()
        : `${DAY_ABBR[startDay].toUpperCase()}–${DAY_ABBR[endDay].toUpperCase()}`;
    const value = startHours ? `${startHours.open}–${startHours.close}` : "Closed";

    rows.push({ label, value });
    i = j + 1;
  }

  return rows;
}

const DIRECTIONS_HREF = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  RESTAURANT.address,
)}`;

export function VisitSection() {
  const hoursRows = groupHours(HOURS);
  const [addressLine1, addressLine2] = RESTAURANT.address.split(", ");

  return (
    <section
      id="visit"
      aria-labelledby="visit-heading"
      className="bg-offwhite px-6 py-24 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal as="div">
          <SectionLabel tone="copper">Find Us</SectionLabel>
          <h2
            id="visit-heading"
            className="mt-4 font-serif text-4xl leading-[1.08] text-charcoal sm:text-5xl"
          >
            Visit
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[45fr_55fr] lg:gap-16">
          {/* Contact details column */}
          <Reveal as="div" delay={0.08}>
            <dl className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.24em] text-copper">
                  Address
                </dt>
                <dd className="mt-3 text-lg leading-relaxed text-charcoal-soft">
                  {addressLine1}
                  <br />
                  {addressLine2}
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.24em] text-copper">
                  Phone
                </dt>
                <dd className="mt-3 text-lg leading-relaxed text-charcoal-soft">
                  <a
                    href={RESTAURANT.phoneHref}
                    aria-label="Call the Restaurant"
                    className="underline decoration-copper/40 underline-offset-4 transition-colors duration-300 hover:text-copper"
                  >
                    {RESTAURANT.phone}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.24em] text-copper">
                  Hours
                </dt>
                <dd className="mt-3 text-charcoal-soft">
                  <ul className="space-y-1.5">
                    {hoursRows.map((row) => (
                      <li
                        key={row.label}
                        className="flex items-baseline justify-between gap-6 text-base leading-relaxed sm:max-w-[220px]"
                      >
                        <span className="text-charcoal-soft/70">{row.label}</span>
                        <span className="text-lg text-charcoal-soft">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>

              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.24em] text-copper">
                  Parking
                </dt>
                <dd className="mt-3 text-lg leading-relaxed text-charcoal-soft">
                  {RESTAURANT.parking}
                </dd>
              </div>
            </dl>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <MagneticButton
                as="a"
                href={DIRECTIONS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-sm bg-copper px-6 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-cream transition-colors duration-300 hover:bg-brown"
              >
                Get Directions
              </MagneticButton>

              <a
                href={RESTAURANT.phoneHref}
                className="inline-flex items-center rounded-sm border border-charcoal/25 px-6 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-charcoal transition-colors duration-300 hover:border-copper hover:text-copper"
              >
                Call the Restaurant
              </a>
            </div>
          </Reveal>

          {/* Map */}
          <Reveal as="div" delay={0.14} className="lg:mt-1">
            <MapSection />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
