import { productInputSchema } from "@/lib/admin-catalogue-schema";
import { fillMissingHindi, productHindiPairs } from "@/lib/translate-hi";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { catalogueFailure, requireCatalogueView } from "@/lib/catalogue-http";
import { withAdminWrite } from "@/lib/admin-guard";
import { getPrisma } from "@/lib/prisma";
import {
  CatalogueNotFoundError,
  catalogueAccess,
  getAdminProduct,
  toAdminProduct,
  updateAdminProduct,
} from "@/services/admin-catalogue";

export async function GET(request: Request, context: RouteContext<"/api/admin/products/[id]">) {
  const access = await requireCatalogueView(request);

  if (!access.ok) {
    return access.response;
  }

  const { id } = await context.params;
  const product = await getAdminProduct(getPrisma(), id);

  if (!product) {
    return apiError("Product not found.", 404);
  }

  return apiSuccess("Product fetched successfully", toAdminProduct(product, access.access));
}

export async function PATCH(request: Request, context: RouteContext<"/api/admin/products/[id]">) {
  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("The request body must be JSON.", 400);
  }

  const parsed = productInputSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const input = await fillMissingHindi(parsed.data, productHindiPairs);
    const result = await withAdminWrite(request, "product.update", async (db, actor) => {
      const access = catalogueAccess(actor.role);
      const product = await updateAdminProduct(db, id, input, access);

      if (!product) {
        throw new CatalogueNotFoundError("Product not found.");
      }

      return {
        value: toAdminProduct(product, access),
        audit: {
          action: "product.update",
          entityType: "Product",
          entityId: id,
          summary: "Updated a product",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Product updated", result.value);
  } catch (error) {
    return catalogueFailure(error) ?? Promise.reject(error);
  }
}
