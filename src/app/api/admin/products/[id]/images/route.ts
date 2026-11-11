import { imageInputSchema } from "@/lib/admin-catalogue-schema";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { catalogueFailure } from "@/lib/catalogue-http";
import { withAdminWrite } from "@/lib/admin-guard";
import { addAdminProductImage, CatalogueNotFoundError } from "@/services/admin-catalogue";

export async function POST(request: Request, context: RouteContext<"/api/admin/products/[id]/images">) {
  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("The request body must be JSON.", 400);
  }

  const parsed = imageInputSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "product.update", async (db) => {
      const image = await addAdminProductImage(db, id, parsed.data);

      if (!image) {
        throw new CatalogueNotFoundError("Product not found.");
      }

      return {
        value: image,
        audit: {
          action: "product.image.create",
          entityType: "ProductImage",
          entityId: image.id,
          summary: "Added a product image",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Image added", result.value, {}, 201);
  } catch (error) {
    return catalogueFailure(error) ?? Promise.reject(error);
  }
}
