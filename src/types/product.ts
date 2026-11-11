export type PriceUnit = "sq-ft" | "piece" | "slab";

export type ProductSort =
  | "newest"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export type QuantityUnit =
  | "Square Feet"
  | "Square Meter"
  | "Pieces"
  | "Slabs"
  | "Boxes";

export type EnquiryType = "Wholesale" | "Retail";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  material: string;
  size?: string;
  thickness?: string;
  finish?: string;
  color?: string;
  usage?: string;
  price?: number;
  priceUnit?: PriceUnit;
  showPrice: boolean;
  availability: string;
  isFeatured: boolean;
  isActive: boolean;
  isDemo?: boolean;
  images: ProductImage[];
  /** Optional crop class for local photography. Not a product specification. */
  imagePosition?: string;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  productCount: number;
}

export interface ProductQuery {
  search?: string;
  categorySlugs?: readonly string[];
  materials?: readonly string[];
  colors?: readonly string[];
  finishes?: readonly string[];
  sizes?: readonly string[];
  sort?: ProductSort;
}

export interface ProductEnquiryDraft {
  name?: string;
  productName: string;
  category: string;
  material?: string;
  size?: string;
  enquiryType: string;
  quantity: string;
  unit: string;
  message?: string;
}
