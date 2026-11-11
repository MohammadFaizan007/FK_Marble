import { productInputSchema } from "@/lib/admin-catalogue-schema";
import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { catalogueFailure, requireCatalogueView } from "@/lib/catalogue-http";
import { withAdminWrite } from "@/lib/admin-guard";
import { getPrisma } from "@/lib/prisma";
import { fillMissingHindi, productHindiPairs } from "@/lib/translate-hi";
import { catalogueAccess, createAdminProduct, listAdminProducts, toAdminProduct } from "@/services/admin-catalogue";

export async function GET(request: Request) {
  const access = await requireCatalogueView(request);

  if (!access.ok) {
    return access.response;
  }

  const products = await listAdminProducts(getPrisma());
  return apiSuccess(
    "Products fetched successfully",
    products.map((product) => toAdminProduct(product, access.access)),
  );
}

export async function POST(request: Request) {
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
    const result = await withAdminWrite(request, "product.create", async (db, actor) => {
      const access = catalogueAccess(actor.role);
      const product = await createAdminProduct(db, input, access);
      return {
        value: toAdminProduct(product, access),
        audit: {
          action: "product.create",
          entityType: "Product",
          entityId: product.id,
          summary: "Created a product",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Product created", result.value, {}, 201);
  } catch (error) {
    return catalogueFailure(error) ?? Promise.reject(error);
  }
}
