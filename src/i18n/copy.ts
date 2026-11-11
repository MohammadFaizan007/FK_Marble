import type { Locale } from "@/i18n/locale";

export function localizedCopy(locale: Locale, english: string, hindi?: string | null): string {
  if (locale === "hi" && hindi?.trim()) {
    return hindi.trim();
  }

  return english;
}

export function localizedOptional(
  locale: Locale,
  english?: string | null,
  hindi?: string | null,
): string | undefined {
  if (!english) {
    return undefined;
  }

  return localizedCopy(locale, english, hindi);
}

const termsHi: Record<string, string> = {
  Ceramic: "सिरेमिक",
  Marble: "संगमरमर",
  Granite: "ग्रेनाइट",
  "Kota Stone": "कोटा स्टोन",
  "Kota Limestone": "कोटा चूना पत्थर",
  Sandstone: "बलुआ पत्थर",
  "Natural Stone": "प्राकृतिक पत्थर",
  Limestone: "चूना पत्थर",
  Matte: "मैट",
  Polished: "पॉलिश",
  Honed: "होन्ड",
  Natural: "प्राकृतिक",
  Beige: "बेज",
  Grey: "स्लेटी",
  Gray: "स्लेटी",
  Black: "काला",
  White: "सफेद",
  Red: "लाल",
  Green: "हरा",
  Gold: "सुनहरा",
  "Indoor floors": "इनडोर फर्श",
  "Indoor walls": "इनडोर दीवारें",
  "Interior floors": "आंतरिक फर्श",
  "Floors and walls": "फर्श और दीवारें",
  "Feature walls and counters": "फीचर दीवारें और काउंटर",
  "Floors and wall cladding": "फर्श और दीवार क्लैडिंग",
  "Counters and floors": "काउंटर और फर्श",
  "Indoor and outdoor floors": "इनडोर और आउटडोर फर्श",
  "Floors and outdoor paving": "फर्श और बाहरी पेविंग",
  "Courtyards and corridors": "आँगन और गलियारे",
  "Paving and wall cladding": "पेविंग और दीवार क्लैडिंग",
  "Outdoor paving": "बाहरी पेविंग",
  "Patios and pathways": "आँगन और रास्ते",
  "Confirm on enquiry": "पूछताछ पर पुष्टि करें",
};

export function catalogueTermHi(english?: string | null): string | null {
  if (!english) {
    return null;
  }

  const trimmed = english.trim();
  const exact = termsHi[trimmed];

  if (exact) {
    return exact;
  }

  const lower = trimmed.toLowerCase();
  const key = Object.keys(termsHi).find((term) => term.toLowerCase() === lower);
  return key ? termsHi[key] : null;
}

const productNamesHi: Record<string, string> = {
  "sample-tile-surface": "नमूना टाइल सतह",
  "sample-white-wall-tile": "नमूना सफेद दीवार टाइल",
  "sample-marble-surface": "नमूना संगमरमर सतह",
  "sample-grey-marble-slab": "नमूना स्लेटी संगमरमर स्लैब",
  "sample-granite-surface": "नमूना ग्रेनाइट सतह",
  "sample-grey-granite-tile": "नमूना स्लेटी ग्रेनाइट टाइल",
  "sample-kota-stone-surface": "नमूना कोटा स्टोन सतह",
  "sample-honed-kota-tile": "नमूना होन्ड कोटा टाइल",
  "sample-sandstone-surface": "नमूना बलुआ पत्थर सतह",
  "sample-beige-sandstone": "नमूना बेज बलुआ पत्थर",
  "sample-natural-stone-surface": "नमूना प्राकृतिक पत्थर सतह",
  "sample-white-natural-stone": "नमूना सफेद प्राकृतिक पत्थर",
  "hidden-sample-tile": "छिपा नमूना टाइल",
};

export function productNameHi(slug: string): string | null {
  return productNamesHi[slug] ?? null;
}

export function productDescriptionHi(slug: string): string | null {
  const name = productNamesHi[slug];

  if (!name) {
    return null;
  }

  return `डेवलपमेंट नमूना। ${name} केवल लेआउट और परीक्षण के लिए रखा गया है। यह एफके मार्बल का स्टॉक नहीं है।`;
}

export const categoryCopyHi: Record<string, { name: string; description: string }> = {
  tiles: {
    name: "टाइल्स",
    description: "इनडोर और आउटडोर उपयोग के लिए फर्श और दीवार की टाइलें।",
  },
  marble: {
    name: "संगमरमर",
    description: "फर्श, दीवारों और काउंटरों के लिए प्राकृतिक संगमरमर।",
  },
  granite: {
    name: "ग्रेनाइट",
    description: "फर्श, काउंटर और बाहरी हिस्सों के लिए प्राकृतिक ग्रेनाइट।",
  },
  "kota-stone": {
    name: "कोटा स्टोन",
    description: "फर्श और बाहरी सतहों के लिए कोटा चूना पत्थर।",
  },
  sandstone: {
    name: "बलुआ पत्थर",
    description: "पेविंग और दीवार क्लैडिंग के लिए प्राकृतिक बलुआ पत्थर।",
  },
  "natural-stone": {
    name: "अन्य प्राकृतिक पत्थर",
    description: "अनुरोध पर उपलब्ध अन्य प्राकृतिक पत्थर।",
  },
};
