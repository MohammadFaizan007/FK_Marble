export type PublicCategory = {
  id: string;
  name: string;
  nameHi: string | null;
  slug: string;
  description: string;
  descriptionHi: string | null;
  image: string;
  displayOrder: number;
  productCount: number;
};

export type PublicProductImage = {
  id: string;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
};

export type PublicProduct = {
  id: string;
  name: string;
  nameHi: string | null;
  slug: string;
  description: string;
  descriptionHi: string | null;
  material: string;
  materialHi: string | null;
  size: string | null;
  thickness: string | null;
  finish: string | null;
  finishHi: string | null;
  color: string | null;
  colorHi: string | null;
  usage: string | null;
  usageHi: string | null;
  price: string | null;
  priceUnit: "SQ_FT" | "PIECE" | "SLAB" | null;
  showPrice: boolean;
  availability: string;
  availabilityHi: string | null;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    nameHi: string | null;
    slug: string;
    description: string;
    descriptionHi: string | null;
    image: string;
  };
  images: PublicProductImage[];
  primaryImage: PublicProductImage | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicBusinessSettings = {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  state: string;
  openingTime: string;
  closingTime: string;
  businessDescription: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
