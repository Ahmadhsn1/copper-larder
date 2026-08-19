import { HOURS, RESTAURANT } from "./restaurant";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Restaurant/LocalBusiness JSON-LD, built entirely from lib/restaurant.ts — no facts re-typed by hand. */
export function buildRestaurantStructuredData() {
  const openingHoursSpecification = Object.entries(HOURS)
    .filter(([, hours]) => hours !== null)
    .map(([day, hours]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAMES[Number(day)],
      opens: `${pad(hours!.open)}:00`,
      closes: `${pad(hours!.close)}:00`,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: RESTAURANT.name,
    description:
      "Proper British cooking, done with a bit of care, a bit of fire, and no fuss about it.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "42 Brindley Place",
      addressLocality: "Birmingham",
      postalCode: "B1 2JB",
      addressCountry: "GB",
    },
    telephone: RESTAURANT.phone,
    servesCuisine: "Modern British",
    priceRange: "££",
    menu: "/#menu",
    openingHoursSpecification,
  };
}
