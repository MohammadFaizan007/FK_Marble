export const editorialImages = {
  hero: {
    src: "/images/showroom/hero-showroom.jpg",
    alt: "Marble showroom with illuminated stone panels and a central marble island.",
  },
  aboutInterior: {
    src: "/images/showroom/showroom-salon.jpg",
    alt: "Reference photograph of a marble showroom interior. Not an FK Marble project.",
  },
  aboutStone: {
    src: "/images/products/marble-stack.jpg",
    alt: "Reference photograph of stacked white marble slabs. Not an FK Marble project.",
  },
} as const;

export type GalleryImage = {
  src: string;
  alt: string;
  orientation: "portrait" | "landscape";
};

export const galleryImages: readonly GalleryImage[] = [
  {
    src: "/images/products/marble-slab.png",
    alt: "A white marble slab with grey veining. Reference photograph, not an FK Marble project.",
    orientation: "landscape",
  },
  {
    src: "/images/products/marble-gold.jpg",
    alt: "A white marble slab with gold veining. Reference photograph, not an FK Marble project.",
    orientation: "landscape",
  },
  {
    src: "/images/products/granite-black.png",
    alt: "Close view of a polished black granite surface. Reference photograph, not an FK Marble project.",
    orientation: "landscape",
  },
  {
    src: "/images/products/tiles-beige.png",
    alt: "Beige floor tiles with light grout lines. Reference photograph, not an FK Marble project.",
    orientation: "portrait",
  },
  {
    src: "/images/products/kota-tiles.jpg",
    alt: "Grey-green stone tiles laid as a floor. Reference photograph, not an FK Marble project.",
    orientation: "landscape",
  },
  {
    src: "/images/products/sandstone-red.png",
    alt: "Stacks of red sandstone slabs. Reference photograph, not an FK Marble project.",
    orientation: "portrait",
  },
  {
    src: "/images/products/stone-patio.jpg",
    alt: "Grey natural stone paving beside a house. Reference photograph, not an FK Marble project.",
    orientation: "landscape",
  },
  {
    src: "/images/showroom/showroom-salon.jpg",
    alt: "A marble showroom interior with lit stone panels. Reference photograph, not an FK Marble project.",
    orientation: "landscape",
  },
];
