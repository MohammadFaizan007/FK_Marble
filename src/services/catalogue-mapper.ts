import { catalogueCategories } from "@/config/categories";
import { localizedCopy, localizedOptional } from "@/i18n/copy";
import type { Locale } from "@/i18n/locale";
import type { PriceUnit, Product, ProductCategory } from "@/types/product";
import type { PublicCategory, PublicProduct } from "@/types/api";

type DecimalLike = { toString(): string } | null;

export type StoredImage = {
  id: string;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
};

export type StoredCategory = {
  id: string;
  name: string;
  nameHi?: string | null;
  slug: string;
  description: string;
  descriptionHi?: string | null;
  image: string;
  displayOrder: number;
  _count?: { products: number };
};

export type StoredProduct = {
  id: string;
  name: string;
  nameHi?: string | null;
  slug: string;
  description: string;
  descriptionHi?: string | null;
  material: string;
  materialHi?: string | null;
  size: string | null;
  thickness: string | null;
  finish: string | null;
  finishHi?: string | null;
  color: string | null;
  colorHi?: string | null;
  usage: string | null;
  usageHi?: string | null;
  price: DecimalLike;
  priceUnit: "SQ_FT" | "PIECE" | "SLAB" | null;
  showPrice: boolean;
  availability: string;
  availabilityHi?: string | null;
  isFeatured: boolean;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: StoredCategory;
  images: StoredImage[];
};

const priceUnits: Record<NonNullable<StoredProduct["priceUnit"]>, PriceUnit> = {
  SQ_FT: "sq-ft",
  PIECE: "piece",
  SLAB: "slab",
};

function presentation(slug: string) {
  return catalogueCategories.find((category) => category.slug === slug);
}

function listedPrice(product: StoredProduct): string | null {
  if (!product.showPrice || !product.price) {
    return null;
  }

  return product.price.toString();
}

export function toPublicCategory(category: StoredCategory): PublicCategory {
  return {
    id: category.id,
    name: category.name,
    nameHi: category.nameHi ?? null,
    slug: category.slug,
    description: category.description,
    descriptionHi: category.descriptionHi ?? null,
    image: category.image,
    displayOrder: category.displayOrder,
    productCount: category._count?.products ?? 0,
  };
}

export function toUiCategory(category: StoredCategory, locale: Locale = "en"): ProductCategory {
  const card = presentation(category.slug);
  const name = localizedCopy(locale, category.name, category.nameHi);

  return {
    id: category.id,
    name,
    slug: category.slug,
    description: localizedCopy(locale, category.description, category.descriptionHi),
    image: category.image || card?.image || "",
    imageAlt: name,
    productCount: category._count?.products ?? 0,
  };
}

export function toPublicProduct(product: StoredProduct): PublicProduct {
  const images = [...product.images].sort((left, right) => left.displayOrder - right.displayOrder);
  const primary = images.find((image) => image.isPrimary) ?? images[0] ?? null;

  return {
    id: product.id,
    name: product.name,
    nameHi: product.nameHi ?? null,
    slug: product.slug,
    description: product.description,
    descriptionHi: product.descriptionHi ?? null,
    material: product.material,
    materialHi: product.materialHi ?? null,
    size: product.size,
    thickness: product.thickness,
    finish: product.finish,
    finishHi: product.finishHi ?? null,
    color: product.color,
    colorHi: product.colorHi ?? null,
    usage: product.usage,
    usageHi: product.usageHi ?? null,
    price: listedPrice(product),
    priceUnit: product.showPrice ? product.priceUnit : null,
    showPrice: product.showPrice,
    availability: product.availability,
    availabilityHi: product.availabilityHi ?? null,
    isFeatured: product.isFeatured,
    category: {
      id: product.category.id,
      name: product.category.name,
      nameHi: product.category.nameHi ?? null,
      slug: product.category.slug,
      description: product.category.description,
      descriptionHi: product.category.descriptionHi ?? null,
      image: product.category.image,
    },
    images: images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
    })),
    primaryImage: primary
      ? {
          id: primary.id,
          imageUrl: primary.imageUrl,
          altText: primary.altText,
          isPrimary: primary.isPrimary,
          displayOrder: primary.displayOrder,
        }
      : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function toUiProduct(product: StoredProduct, locale: Locale = "en"): Product {
  const card = presentation(product.category.slug);
  const priceText = listedPrice(product);
  const price = priceText === null ? undefined : Number(priceText);

  return {
    id: product.id,
    name: localizedCopy(locale, product.name, product.nameHi),
    slug: product.slug,
    description: localizedCopy(locale, product.description, product.descriptionHi),
    categoryId: product.category.id,
    categorySlug: product.category.slug,
    categoryName: localizedCopy(
      locale,
      card?.name ?? product.category.name,
      card?.nameHi ?? product.category.nameHi,
    ),
    material: localizedCopy(locale, product.material, product.materialHi),
    size: product.size ?? undefined,
    thickness: product.thickness ?? undefined,
    finish: localizedOptional(locale, product.finish, product.finishHi),
    color: localizedOptional(locale, product.color, product.colorHi),
    usage: localizedOptional(locale, product.usage, product.usageHi),
    price: price !== undefined && Number.isFinite(price) ? price : undefined,
    priceUnit: product.priceUnit ? priceUnits[product.priceUnit] : undefined,
    showPrice: product.showPrice,
    availability: localizedCopy(locale, product.availability, product.availabilityHi),
    isFeatured: product.isFeatured,
    isActive: true,
    isDemo: product.isDemo,
    images: [...product.images]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((image) => ({
        id: image.id,
        url: image.imageUrl,
        alt: image.altText,
        isPrimary: image.isPrimary,
        displayOrder: image.displayOrder,
      })),
    createdAt: product.createdAt.toISOString(),
  };
}
