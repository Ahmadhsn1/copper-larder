// Curated photography for the marketing site. Real, licensed Unsplash
// photography (free for commercial/noncommercial use under the Unsplash
// License) — every URL below was verified to resolve before being used.
// Centralised here so every section pulls from one accountable source
// rather than hand-typing image URLs inline.

export type SiteImage = {
  src: string;
  alt: string;
};

function unsplash(id: string, w: number, q = 80): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;
}

export const HERO_IMAGE: SiteImage = {
  src: unsplash("1764253422050-198df300772c", 2400),
  alt: "A warm, softly lit restaurant dining room with wooden tables and chairs set for service",
};

export const INTRO_IMAGE: SiteImage = {
  src: unsplash("1670819917685-f1040e76b9b7", 1600),
  alt: "Warm wood-panelled restaurant interior with tables and chairs",
};

export const SIGNATURE_DISH_IMAGE: SiteImage = {
  src: unsplash("1769773183948-d24e3c5a2b82", 2000),
  alt: "Braised beef with a rich red wine sauce and vegetables",
};

export const ABOUT_IMAGES: SiteImage[] = [
  {
    src: unsplash("1745066114191-004e89b8aade", 1200),
    alt: "Copper pendant lights hanging low over the dining room",
  },
  {
    src: unsplash("1743793054819-37e412d65295", 1200),
    alt: "A long reclaimed oak table set for a meal",
  },
  {
    src: unsplash("1577106263724-2c8e03bfe9cf", 1200),
    alt: "A hand plating food in the kitchen",
  },
];

export const SUNDAY_ROAST_IMAGE: SiteImage = {
  src: unsplash("1766701753169-5ed4a00d4217", 1800),
  alt: "Plates of roasted meat and vegetables, ready to serve",
};

export const GALLERY_IMAGES: SiteImage[] = [
  {
    src: unsplash("1602232037779-30b01ac3c457", 1400),
    alt: "A reclaimed wooden table set for dining",
  },
  {
    src: unsplash("1557006021-33893f5b2123", 1400),
    alt: "A warm brass pendant light",
  },
  {
    src: unsplash("1673720111802-8992b0203130", 1400),
    alt: "A plated dish beside a glass of red wine",
  },
  {
    src: unsplash("1774509621816-8c097e4f2d88", 1400),
    alt: "A candlelit table set with wine and flowers",
  },
  {
    src: unsplash("1668998909685-f23656e70eb9", 1400),
    alt: "Canalside buildings at Brindley Place",
  },
  {
    src: unsplash("1616401616927-3c81de22dfa8", 1400),
    alt: "Roasted chicken, carved and ready to serve",
  },
  {
    src: unsplash("1591944173662-85fbc5a495a1", 1400),
    alt: "A warm dining corner with wooden chairs",
  },
  {
    src: unsplash("1622021142947-da7dedc7c39a", 1400),
    alt: "A chef preparing vegetables in the kitchen",
  },
];
