import { siteConfig } from "@/config/site";

const week = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: siteConfig.name,
    description: siteConfig.description,
    telephone: "+919045760027",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.line1,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: week,
      opens: siteConfig.hours.opensAt,
      closes: siteConfig.hours.closesAt,
    },
    areaServed: `${siteConfig.address.city}, ${siteConfig.address.state}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Stone and surfaces",
      itemListElement: siteConfig.categories.map((category) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: category.name,
          description: category.description,
        },
      })),
    },
  };
}
