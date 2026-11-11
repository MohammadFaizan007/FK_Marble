import { siteConfig, type ProductCategorySlug } from "@/config/site";
import { localizedCopy } from "@/i18n/copy";
import type { Locale } from "@/i18n/locale";

const cardCopy = {
  tiles: {
    name: "Premium Tiles",
    nameHi: "प्रीमियम टाइल्स",
    description: "Floor and wall tiles for homes and commercial spaces.",
    descriptionHi: "घरों और व्यावसायिक स्थानों के लिए फर्श और दीवार की टाइलें।",
    imageAlt: "Close view of beige floor tiles with light grout lines.",
    imageAltHi: "हल्की ग्राउट लाइनों वाली बेज फर्श टाइलों का नज़दीकी दृश्य।",
    imagePosition: "object-center",
    routeSlug: "tiles",
    catalogueId: "cat-tiles",
  },
  marble: {
    name: "Natural Marble",
    nameHi: "प्राकृतिक संगमरमर",
    description: "Natural marble for floors, walls, and counters.",
    descriptionHi: "फर्श, दीवारों और काउंटरों के लिए प्राकृतिक संगमरमर।",
    imageAlt: "A white marble slab with grey veining, standing in a showroom.",
    imageAltHi: "शोरूम में खड़ा, स्लेटी नसों वाला सफेद संगमरमर स्लैब।",
    imagePosition: "object-center",
    routeSlug: "marble",
    catalogueId: "cat-marble",
  },
  granite: {
    name: "Granite",
    nameHi: "ग्रेनाइट",
    description: "Natural granite for floors, counters, and exteriors.",
    descriptionHi: "फर्श, काउंटर और बाहरी हिस्सों के लिए प्राकृतिक ग्रेनाइट।",
    imageAlt: "Close view of a polished black granite surface.",
    imageAltHi: "पॉलिश की हुई काली ग्रेनाइट सतह का नज़दीकी दृश्य।",
    imagePosition: "object-center",
    routeSlug: "granite",
    catalogueId: "cat-granite",
  },
  "kota-stone": {
    name: "Kota Stone",
    nameHi: "कोटा स्टोन",
    description: "Kota limestone for flooring and outdoor surfaces.",
    descriptionHi: "फर्श और बाहरी सतहों के लिए कोटा चूना पत्थर।",
    imageAlt: "Grey-green Kota stone tiles laid out as a floor.",
    imageAltHi: "फर्श के रूप में बिछाई गई स्लेटी-हरी कोटा स्टोन टाइलें।",
    imagePosition: "object-center",
    routeSlug: "kota-stone",
    catalogueId: "cat-kota-stone",
  },
  sandstone: {
    name: "Sandstone",
    nameHi: "बलुआ पत्थर",
    description: "Natural sandstone for paving and wall cladding.",
    descriptionHi: "पेविंग और दीवार क्लैडिंग के लिए प्राकृतिक बलुआ पत्थर।",
    imageAlt: "Stacks of red sandstone slabs.",
    imageAltHi: "लाल बलुआ पत्थर के स्लैब के ढेर।",
    imagePosition: "object-center",
    routeSlug: "sandstone",
    catalogueId: "cat-sandstone",
  },
  "other-natural-stone": {
    name: "Other Natural Stone",
    nameHi: "अन्य प्राकृतिक पत्थर",
    description: "Additional natural stones supplied on request.",
    descriptionHi: "अनुरोध पर उपलब्ध अन्य प्राकृतिक पत्थर।",
    imageAlt: "Grey natural stone paving on an outdoor terrace.",
    imageAltHi: "बाहरी छत पर स्लेटी प्राकृतिक पत्थर की पेविंग।",
    imagePosition: "object-[center_70%]",
    routeSlug: "natural-stone",
    catalogueId: "cat-natural-stone",
  },
} as const satisfies Record<
  ProductCategorySlug,
  {
    name: string;
    nameHi: string;
    description: string;
    descriptionHi: string;
    imageAlt: string;
    imageAltHi: string;
    imagePosition: string;
    routeSlug: string;
    catalogueId: string;
  }
>;

export type CollectionCard = {
  slug: ProductCategorySlug;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  href: string;
};

export function getCollectionCards(locale: Locale = "en"): CollectionCard[] {
  return siteConfig.categories.map((category) => {
    const copy = cardCopy[category.slug];

    return {
      slug: category.slug,
      name: localizedCopy(locale, copy.name, copy.nameHi),
      description: localizedCopy(locale, copy.description, copy.descriptionHi),
      image: category.image,
      imageAlt: localizedCopy(locale, copy.imageAlt, copy.imageAltHi),
      imagePosition: copy.imagePosition,
      href: `/categories/${copy.routeSlug}`,
    };
  });
}

/** Catalogue categories. `natural-stone` is the public slug for Other Natural Stone. */
export const catalogueCategories = siteConfig.categories.map((category) => {
  const copy = cardCopy[category.slug];

  return {
    id: copy.catalogueId,
    name: copy.name,
    nameHi: copy.nameHi,
    slug: copy.routeSlug,
    description: copy.description,
    descriptionHi: copy.descriptionHi,
    image: category.image,
    imageAlt: copy.imageAlt,
    imageAltHi: copy.imageAltHi,
  };
});

export type CatalogueCategorySeed = (typeof catalogueCategories)[number];
