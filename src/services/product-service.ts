import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { Locale } from "@/i18n/locale";
import {
  productOrderBy,
  publicCategorySlug,
  publicProductWhere,
  type PublicProductQuery,
} from "@/lib/catalogue-query";
import {
  databaseSetupMessage,
  databaseUnavailableMessage,
  isDatabaseConfigured,
} from "@/lib/database";
import type { EnquiryInput } from "@/lib/enquiry-schema";
import { getPrisma } from "@/lib/prisma";
import {
  toPublicCategory,
  toPublicProduct,
  toUiCategory,
  toUiProduct,
  type StoredCategory,
  type StoredProduct,
} from "@/services/catalogue-mapper";
import type { PaginationMeta, PublicBusinessSettings, PublicCategory, PublicProduct } from "@/types/api";
import type { Product, ProductCategory } from "@/types/product";

const catalogueLimit = 200;

const productInclude = {
  category: true,
  images: { orderBy: { displayOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

const categoryCount = {
  _count: {
    select: {
      products: { where: { isActive: true, isDemo: false } },
    },
  },
} satisfies Prisma.CategoryInclude;

export type ServiceFailure = {
  ok: false;
  code: "not_configured" | "unavailable";
  message: string;
};

export type ServiceResult<T> = { ok: true; data: T } | ServiceFailure;

export type ProductPage = {
  items: PublicProduct[];
  meta: PaginationMeta;
};

function failure(code: ServiceFailure["code"], message: string): ServiceFailure {
  return { ok: false, code, message };
}

function logDatabaseError(error: unknown, action: string) {
  const name = error instanceof Error ? error.name : "Error";
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  console.error(`${action}: ${name} ${code}`.trim());
}

async function withDatabase<T>(work: (prisma: PrismaClient) => Promise<T>): Promise<ServiceResult<T>> {
  if (!isDatabaseConfigured()) {
    return failure("not_configured", databaseSetupMessage);
  }

  try {
    return { ok: true, data: await work(getPrisma()) };
  } catch (error) {
    logDatabaseError(error, "Catalogue database request failed");
    return failure("unavailable", databaseUnavailableMessage);
  }
}

function pageQuery(query: Partial<PublicProductQuery>, limit: number): PublicProductQuery {
  return {
    page: query.page ?? 1,
    limit,
    search: query.search,
    categorySlug: publicCategorySlug(query.categorySlug),
    materials: query.materials ?? [],
    colors: query.colors ?? [],
    finishes: query.finishes ?? [],
    sizes: query.sizes ?? [],
    sortBy: query.sortBy ?? "createdAt",
    sortOrder: query.sortOrder ?? "desc",
  };
}

async function findProductPage(prisma: PrismaClient, query: PublicProductQuery): Promise<ProductPage> {
  const where = publicProductWhere(query) as Prisma.ProductWhereInput;
  const skip = (query.page - 1) * query.limit;
  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: productOrderBy(query),
      skip,
      take: query.limit,
      include: productInclude,
    }),
  ]);

  return {
    items: rows.map((row) => toPublicProduct(row as StoredProduct)),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    },
  };
}

export function getProducts(query: Partial<PublicProductQuery> = {}): Promise<ServiceResult<ProductPage>> {
  return withDatabase((prisma) => findProductPage(prisma, pageQuery(query, query.limit ?? 12)));
}

export function searchProducts(
  search: string,
  query: Partial<PublicProductQuery> = {},
): Promise<ServiceResult<ProductPage>> {
  return getProducts({ ...query, search });
}

export function getProductsByCategory(
  slug: string,
  query: Partial<PublicProductQuery> = {},
): Promise<ServiceResult<ProductPage>> {
  return getProducts({ ...query, categorySlug: slug });
}

export function getCategories(): Promise<ServiceResult<PublicCategory[]>> {
  return withDatabase(async (prisma) => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: categoryCount,
    });

    return categories.map((category) => toPublicCategory(category as StoredCategory));
  });
}

export function getCategoryBySlug(slug: string): Promise<ServiceResult<PublicCategory | null>> {
  const publicSlug = publicCategorySlug(slug) ?? slug;

  return withDatabase(async (prisma) => {
    const category = await prisma.category.findFirst({
      where: { slug: publicSlug, isActive: true },
      include: categoryCount,
    });

    return category ? toPublicCategory(category as StoredCategory) : null;
  });
}

export function getProductBySlug(
  slug: string,
): Promise<ServiceResult<{ product: PublicProduct; relatedProducts: PublicProduct[] } | null>> {
  return withDatabase(async (prisma) => {
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true, isDemo: false },
      include: productInclude,
    });

    if (!product) {
      return null;
    }

    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        isDemo: false,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: productInclude,
    });

    return {
      product: toPublicProduct(product as StoredProduct),
      relatedProducts: related.map((item) => toPublicProduct(item as StoredProduct)),
    };
  });
}

export function getBusinessSettings(): Promise<ServiceResult<PublicBusinessSettings | null>> {
  return withDatabase(async (prisma) => {
    const settings = await prisma.businessSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!settings) {
      return null;
    }

    return {
      businessName: settings.businessName,
      tagline: settings.tagline,
      phone: settings.phone,
      whatsappNumber: settings.whatsappNumber,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      businessDescription: settings.businessDescription,
    };
  });
}

export function createEnquiry(
  input: EnquiryInput,
): Promise<ServiceResult<{ id: string; status: "PENDING" }> | { ok: false; code: "invalid_product"; message: string }> {
  if (!isDatabaseConfigured()) {
    return Promise.resolve(failure("not_configured", databaseSetupMessage));
  }

  return getPrisma()
    .$transaction(async (prisma) => {
      let productName = input.productName ?? null;
      let productId = input.productId ?? null;

      if (productId) {
        const product = await prisma.product.findFirst({
          where: { id: productId, isActive: true, isDemo: false },
          select: { id: true, name: true },
        });

        if (!product) {
          return { ok: false as const, code: "invalid_product" as const, message: "The selected product is not available." };
        }

        productId = product.id;
        productName = product.name;
      }

      const enquiry = await prisma.enquiry.create({
        data: {
          customerName: input.customerName,
          phone: input.phone,
          email: input.email ?? null,
          productId,
          productName,
          enquiryType: input.enquiryType,
          quantity: input.quantity.toString(),
          quantityUnit: input.quantityUnit,
          message: input.message ?? null,
          status: "PENDING",
        },
        select: { id: true },
      });

      return { ok: true as const, data: { id: enquiry.id, status: "PENDING" as const } };
    })
    .catch((error: unknown) => {
      logDatabaseError(error, "Enquiry could not be saved");
      return failure("unavailable", databaseUnavailableMessage);
    });
}

export function listProducts(locale: Locale = "en"): Promise<ServiceResult<Product[]>> {
  return withDatabase(async (prisma) => {
    const rows = await prisma.product.findMany({
      where: publicProductWhere({}) as Prisma.ProductWhereInput,
      orderBy: { createdAt: "desc" },
      take: catalogueLimit,
      include: productInclude,
    });

    return rows.map((row) => toUiProduct(row as StoredProduct, locale));
  });
}

export function listCategories(locale: Locale = "en"): Promise<ServiceResult<ProductCategory[]>> {
  return withDatabase(async (prisma) => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: categoryCount,
    });

    return categories.map((category) => toUiCategory(category as StoredCategory, locale));
  });
}

export async function getUiCategoryBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<ServiceResult<ProductCategory | null>> {
  const result = await listCategories(locale);

  if (!result.ok) {
    return result;
  }

  const publicSlug = publicCategorySlug(slug) ?? slug;
  return { ok: true, data: result.data.find((category) => category.slug === publicSlug) ?? null };
}

export function getUiProductBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<ServiceResult<Product | null>> {
  return withDatabase(async (prisma) => {
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true, isDemo: false },
      include: productInclude,
    });

    return product ? toUiProduct(product as StoredProduct, locale) : null;
  });
}

export function listFeaturedProducts(locale: Locale = "en"): Promise<ServiceResult<Product[]>> {
  return withDatabase(async (prisma) => {
    const rows = await prisma.product.findMany({
      where: { isActive: true, isDemo: false, isFeatured: true },
      orderBy: [{ category: { displayOrder: "asc" } }, { name: "asc" }],
      include: productInclude,
    });

    return rows.map((row) => toUiProduct(row as StoredProduct, locale));
  });
}

export function listRelatedProducts(
  product: Product,
  limit = 3,
  locale: Locale = "en",
): Promise<ServiceResult<Product[]>> {
  return withDatabase(async (prisma) => {
    const rows = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        isDemo: false,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: productInclude,
    });

    return rows.map((row) => toUiProduct(row as StoredProduct, locale));
  });
}
