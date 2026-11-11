import { categoryInputSchema } from "@/lib/admin-catalogue-schema";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { catalogueFailure, requireCatalogueView } from "@/lib/catalogue-http";
import { withAdminWrite } from "@/lib/admin-guard";
import { getPrisma } from "@/lib/prisma";
import { categoryHindiPairs, fillMissingHindi } from "@/lib/translate-hi";
import { createAdminCategory, listAdminCategories } from "@/services/admin-catalogue";

export async function GET(request: Request) {
  const access = await requireCatalogueView(request);

  if (!access.ok) {
    return access.response;
  }

  const categories = await listAdminCategories(getPrisma());
  return apiSuccess(
    "Categories fetched successfully",
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      nameHi: category.nameHi,
      slug: category.slug,
      description: category.description,
      descriptionHi: category.descriptionHi,
      image: category.image,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      productCount: category._count.products,
    })),
  );
}

export async function POST(request: Request) {
  const parsed = categoryInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const input = await fillMissingHindi(parsed.data, categoryHindiPairs);
    const result = await withAdminWrite(request, "product.create", async (db) => {
      const category = await createAdminCategory(db, input);
      return {
        value: category,
        audit: {
          action: "category.create",
          entityType: "Category",
          entityId: category.id,
          summary: "Created a category",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Category created", result.value, {}, 201);
  } catch (error) {
    return catalogueFailure(error) ?? Promise.reject(error);
  }
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
