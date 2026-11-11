import { categoryInputSchema } from "@/lib/admin-catalogue-schema";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { catalogueFailure } from "@/lib/catalogue-http";
import { withAdminWrite } from "@/lib/admin-guard";
import { categoryHindiPairs, fillMissingHindi } from "@/lib/translate-hi";
import { removeStoredCategoryImage } from "@/lib/local-upload";
import { CatalogueNotFoundError, deleteAdminCategory, updateAdminCategory } from "@/services/admin-catalogue";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/categories/[id]">) {
  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("The request body must be JSON.", 400);
  }

  const parsed = categoryInputSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  let replacedImage: string | null = null;

  try {
    const input = await fillMissingHindi(parsed.data, categoryHindiPairs);
    const result = await withAdminWrite(request, "product.update", async (db) => {
      const category = await db.category.findUnique({ where: { id }, select: { id: true, image: true } });

      if (!category) {
        throw new CatalogueNotFoundError("Category not found.");
      }

      const updated = await updateAdminCategory(db, id, input);

      if (category.image !== updated.image) {
        replacedImage = category.image;
      }

      return {
        value: updated,
        audit: {
          action: "category.update",
          entityType: "Category",
          entityId: id,
          summary: "Updated a category",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    if (replacedImage) {
      await removeStoredCategoryImage(replacedImage);
    }

    return apiSuccess("Category updated", result.value);
  } catch (error) {
    return catalogueFailure(error) ?? Promise.reject(error);
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/admin/categories/[id]">) {
  const { id } = await context.params;
  let removedImage = "";

  try {
    const result = await withAdminWrite(request, "product.update", async (db) => {
      const removed = await deleteAdminCategory(db, id);

      if (!removed) {
        throw new CatalogueNotFoundError("Category not found.");
      }

      removedImage = removed.image;

      return {
        value: { id: removed.id },
        audit: {
          action: "category.delete",
          entityType: "Category",
          entityId: removed.id,
          summary: "Removed a category",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    await removeStoredCategoryImage(removedImage);
    return apiSuccess("Category removed", result.value);
  } catch (error) {
    return catalogueFailure(error) ?? Promise.reject(error);
  }
}
