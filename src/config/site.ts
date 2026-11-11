const businessModels = ["wholesale", "retail"] as const;

export type BusinessModel = (typeof businessModels)[number];

export const siteConfig = {
  name: "FK Marble",
  tagline: "STONE & SURFACES",
  description:
    "Wholesale and retail supplier of tiles, marble, granite, Kota stone, sandstone, and other natural stone in Etawah, Uttar Pradesh.",
  logo: {
    dark: "/images/brand/fk-marble-logo-dark.svg",
    light: "/images/brand/fk-marble-logo-light.svg",
    icon: "/images/brand/fk-marble-icon.svg",
    favicon: "/images/brand/favicon.svg",
  },
  locale: "en-IN",
  timeZone: "Asia/Kolkata",
  businessModel: businessModels,
  address: {
    line1: "177, ITI Chauraha",
    city: "Etawah",
    state: "Uttar Pradesh",
    country: "India",
    formatted: "177, ITI Chauraha, Etawah, Uttar Pradesh, India",
  },
  contact: {
    phone: "9045760027",
    phoneDisplay: "+91 90457 60027",
    phoneHref: "tel:+919045760027",
    whatsapp: "9045760027",
    whatsappHref: "https://wa.me/919045760027",
  },
  hours: {
    opensAt: "09:00",
    closesAt: "20:00",
    label: "9 AM to 8 PM",
    display: "9:00 AM – 8:00 PM",
    days: "Monday to Sunday",
  },
  categories: [
    {
      slug: "tiles",
      name: "Tiles",
      description: "Floor and wall tiles for indoor and outdoor use.",
      image: "/images/products/tiles-beige.png",
    },
    {
      slug: "marble",
      name: "Marble",
      description: "Natural marble for floors, walls, and counters.",
      image: "/images/products/marble-slab.png",
    },
    {
      slug: "granite",
      name: "Granite",
      description: "Natural granite for floors, counters, and exteriors.",
      image: "/images/products/granite-black.png",
    },
    {
      slug: "kota-stone",
      name: "Kota Stone",
      description: "Kota limestone for flooring and outdoor surfaces.",
      image: "/images/products/kota-tiles.jpg",
    },
    {
      slug: "sandstone",
      name: "Sandstone",
      description: "Natural sandstone for paving and wall cladding.",
      image: "/images/products/sandstone-red.png",
    },
    {
      slug: "other-natural-stone",
      name: "Other Natural Stone",
      description: "Additional natural stones supplied on request.",
      image: "/images/products/stone-patio.jpg",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
export type BusinessAddress = SiteConfig["address"];
export type BusinessContact = SiteConfig["contact"];
export type BusinessHours = SiteConfig["hours"];
export type ProductCategory = SiteConfig["categories"][number];
export type ProductCategorySlug = ProductCategory["slug"];
