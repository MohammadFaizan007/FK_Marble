import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { AdminRole } from "@/generated/prisma/client";
import type { CategoryInput, ProductInput } from "@/lib/admin-catalogue-schema";
import { hasPermission } from "@/lib/permissions";

type DecimalLike = { toFixed(digits: number): string } | null;

export class CatalogueAccessError extends Error {
  status = 403;

  constructor() {
    super("You do not have permission for this action.");
    this.name = "CatalogueAccessError";
  }
}

export class CategoryInUseError extends Error {
  constructor() {
    super("This category has products, so the record stays on file.");
    this.name = "CategoryInUseError";
  }
}

export class ProductInUseError extends Error {
  constructor() {
    super("This product is on a purchase order, so the record stays on file.");
    this.name = "ProductInUseError";
  }
}

export class CatalogueNotFoundError extends Error {
  status = 404;

  constructor(message: string) {
    super(message);
    this.name = "CatalogueNotFoundError";
  }
}

export function catalogueAccess(role: AdminRole) {
  return {
    view: hasPermission(role, "product.view"),
    create: hasPermission(role, "product.create"),
    update: hasPermission(role, "product.update"),
    archive: hasPermission(role, "product.archive"),
    prices: hasPermission(role, "price.view"),
    changePrices: hasPermission(role, "price.update"),
    cost: hasPermission(role, "cost.view"),
  };
}

export type CatalogueAccess = ReturnType<typeof catalogueAccess>;

function money(value: DecimalLike): string | null {
  return value ? value.toFixed(2) : null;
}

const productInclude = {
  category: true,
  images: { orderBy: { displayOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

type CatalogueWriter = PrismaClient | Prisma.TransactionClient;

type StoredAdminProduct = {
  id: string;
  name: string;
  nameHi: string | null;
  slug: string;
  description: string;
  descriptionHi: string | null;
  categoryId: string;
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
  availability: string;
  availabilityHi: string | null;
  price: DecimalLike;
  wholesalePrice: DecimalLike;
  costPrice: DecimalLike;
  priceUnit: "SQ_FT" | "PIECE" | "SLAB" | null;
  showPrice: boolean;
  isFeatured: boolean;
  isActive: boolean;
  isDemo: boolean;
  category: { name: string };
  images: AdminImage[];
};

export type AdminImage = {
  id: string;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  nameHi: string | null;
  slug: string;
  description: string;
  descriptionHi: string | null;
  categoryId: string;
  categoryName: string;
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
  availability: string;
  availabilityHi: string | null;
  isFeatured: boolean;
  isActive: boolean;
  isDemo: boolean;
  images: AdminImage[];
  price?: string | null;
  wholesalePrice?: string | null;
  priceUnit?: "SQ_FT" | "PIECE" | "SLAB" | null;
  showPrice?: boolean;
  costPrice?: string | null;
};

export function toAdminProduct(product: StoredAdminProduct, access: CatalogueAccess): AdminProduct {
  const view: AdminProduct = {
    id: product.id,
    name: product.name,
    nameHi: product.nameHi,
    slug: product.slug,
    description: product.description,
    descriptionHi: product.descriptionHi,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    material: product.material,
    materialHi: product.materialHi,
    size: product.size,
    thickness: product.thickness,
    finish: product.finish,
    finishHi: product.finishHi,
    color: product.color,
    colorHi: product.colorHi,
    usage: product.usage,
    usageHi: product.usageHi,
    availability: product.availability,
    availabilityHi: product.availabilityHi,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    isDemo: product.isDemo,
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
    })),
  };

  if (access.prices) {
    view.price = money(product.price);
    view.wholesalePrice = money(product.wholesalePrice);
    view.priceUnit = product.priceUnit;
    view.showPrice = product.showPrice;
  }

  if (access.cost) {
    view.costPrice = money(product.costPrice);
  }

  return view;
}

function writeInput(input: ProductInput, access: CatalogueAccess, current?: StoredAdminProduct): ProductInput {
  const next = { ...input };

  if (!access.changePrices) {
    if (!current && (input.price || input.wholesalePrice || input.priceUnit || input.showPrice)) {
      throw new CatalogueAccessError();
    }

    next.price = current ? money(current.price) : null;
    next.wholesalePrice = current ? money(current.wholesalePrice) : null;
    next.priceUnit = current?.priceUnit ?? null;
    next.showPrice = current?.showPrice ?? false;
  }

  if (!access.cost || !access.changePrices) {
    if (!current && input.costPrice) {
      throw new CatalogueAccessError();
    }

    next.costPrice = current ? money(current.costPrice) : null;
  }

  if (current && (input.isActive !== current.isActive || input.isDemo !== current.isDemo) && !access.archive) {
    throw new CatalogueAccessError();
  }

  return next;
}

async function uniqueSlug(db: CatalogueWriter, table: "category" | "product", slug: string, currentId?: string) {
  const existing =
    table === "category"
      ? await db.category.findUnique({ where: { slug }, select: { id: true } })
      : await db.product.findUnique({ where: { slug }, select: { id: true } });

  if (existing && existing.id !== currentId) {
    throw new Error("This slug is already used.");
  }
}

export async function listAdminCategories(db: PrismaClient) {
  return db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createAdminCategory(db: CatalogueWriter, input: CategoryInput) {
  await uniqueSlug(db, "category", input.slug);
  return db.category.create({
    data: { id: randomUUID(), ...input },
  });
}

export async function updateAdminCategory(db: CatalogueWriter, id: string, input: CategoryInput) {
  await uniqueSlug(db, "category", input.slug, id);
  return db.category.update({ where: { id }, data: input });
}

export async function deleteAdminCategory(db: CatalogueWriter, id: string) {
  const existing = await db.category.findUnique({
    where: { id },
    select: { id: true, image: true, _count: { select: { products: true } } },
  });

  if (!existing) {
    return null;
  }

  if (existing._count.products > 0) {
    throw new CategoryInUseError();
  }

  await db.category.delete({ where: { id } });
  return { id: existing.id, image: existing.image };
}

export async function listAdminProducts(db: PrismaClient) {
  return db.product.findMany({
    include: productInclude,
    orderBy: [{ isDemo: "asc" }, { name: "asc" }],
  });
}

export async function getAdminProduct(db: PrismaClient, id: string) {
  return db.product.findUnique({ where: { id }, include: productInclude });
}

export async function createAdminProduct(db: CatalogueWriter, input: ProductInput, access: CatalogueAccess) {
  const data = writeInput(input, access);
  await uniqueSlug(db, "product", data.slug);
  const category = await db.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });

  if (!category) {
    throw new Error("Choose a category.");
  }

  return db.product.create({
    data: { id: randomUUID(), ...data },
    include: productInclude,
  });
}

export async function deleteAdminProduct(db: CatalogueWriter, id: string) {
  const existing = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      images: { select: { imageUrl: true } },
      _count: { select: { purchaseOrderItems: true, stockMovements: true } },
    },
  });

  if (!existing) {
    return null;
  }

  if (existing._count.purchaseOrderItems > 0 || existing._count.stockMovements > 0) {
    throw new ProductInUseError();
  }

  await db.product.delete({ where: { id } });
  return { id: existing.id, imageUrls: existing.images.map((image) => image.imageUrl) };
}

export async function updateAdminProduct(
  db: CatalogueWriter,
  id: string,
  input: ProductInput,
  access: CatalogueAccess,
) {
  const current = await db.product.findUnique({ where: { id }, include: productInclude });

  if (!current) {
    return null;
  }

  const data = writeInput(input, access, current);
  await uniqueSlug(db, "product", data.slug, id);
  return db.product.update({ where: { id }, data, include: productInclude });
}

export async function addAdminProductImage(
  db: CatalogueWriter,
  productId: string,
  input: { imageUrl: string; altText: string },
) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { images: { select: { displayOrder: true, isPrimary: true } } },
  });

  if (!product) {
    return null;
  }

  return db.productImage.create({
    data: {
      id: randomUUID(),
      productId,
      imageUrl: input.imageUrl,
      altText: input.altText,
      isPrimary: product.images.length === 0,
      displayOrder: product.images.reduce((max, image) => Math.max(max, image.displayOrder), 0) + 1,
    },
  });
}

export async function moveAdminProductImage(db: CatalogueWriter, productId: string, imageId: string, direction: "up" | "down" | "primary") {
  const images = await db.productImage.findMany({ where: { productId }, orderBy: { displayOrder: "asc" } });
  const index = images.findIndex((image) => image.id === imageId);

  if (index < 0) {
    return null;
  }

  if (direction === "primary") {
    await db.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    await db.productImage.update({ where: { id: imageId }, data: { isPrimary: true } });
    return images[index];
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= images.length) {
    return images[index];
  }

  const current = images[index];
  const neighbor = images[swapIndex];
  await db.productImage.update({ where: { id: current.id }, data: { displayOrder: neighbor.displayOrder } });
  await db.productImage.update({ where: { id: neighbor.id }, data: { displayOrder: current.displayOrder } });
  return current;
}

export async function deleteAdminProductImage(db: CatalogueWriter, productId: string, imageId: string) {
  const image = await db.productImage.findFirst({ where: { id: imageId, productId } });

  if (!image) {
    return null;
  }

  await db.productImage.delete({ where: { id: imageId } });

  if (image.isPrimary) {
    const next = await db.productImage.findFirst({ where: { productId }, orderBy: { displayOrder: "asc" } });

    if (next) {
      await db.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  return image;
}
