import { z } from "zod";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { catalogueFailure } from "@/lib/catalogue-http";
import { withAdminWrite } from "@/lib/admin-guard";
import { removeStoredUpload } from "@/lib/local-upload";
import { CatalogueNotFoundError, deleteAdminProductImage, moveAdminProductImage } from "@/services/admin-catalogue";

const moveSchema = z.object({
  direction: z.enum(["up", "down", "primary"]),
});

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/products/[id]/images/[imageId]">,
) {
  const { id, imageId } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("The request body must be JSON.", 400);
  }

  const parsed = moveSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "product.update", async (db) => {
      const image = await moveAdminProductImage(db, id, imageId, parsed.data.direction);

      if (!image) {
        throw new CatalogueNotFoundError("Image not found.");
      }

      return {
        value: { id: image.id },
        audit: {
          action: "product.image.update",
          entityType: "ProductImage",
          entityId: image.id,
          summary: parsed.data.direction === "primary" ? "Set the primary product image" : "Reordered a product image",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Image updated", result.value);
  } catch (error) {
    return catalogueFailure(error) ?? Promise.reject(error);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/admin/products/[id]/images/[imageId]">,
) {
  const { id, imageId } = await context.params;

  let removedUrl = "";

  try {
    const result = await withAdminWrite(request, "product.update", async (db) => {
      const image = await deleteAdminProductImage(db, id, imageId);

      if (!image) {
        throw new CatalogueNotFoundError("Image not found.");
      }

      removedUrl = image.imageUrl;

      return {
        value: { id: image.id },
        audit: {
          action: "product.image.delete",
          entityType: "ProductImage",
          entityId: image.id,
          summary: "Removed a product image",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    await removeStoredUpload(removedUrl);
    return apiSuccess("Image removed", result.value);
  } catch (error) {
    return catalogueFailure(error) ?? Promise.reject(error);
  }
}
