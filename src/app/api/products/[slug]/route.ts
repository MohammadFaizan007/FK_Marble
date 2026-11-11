import { apiError, apiSuccess } from "@/lib/api-response";
import { getProductBySlug } from "@/services/product-service";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const result = await getProductBySlug(slug);

  if (!result.ok) {
    return apiError(result.message, 503);
  }

  if (!result.data) {
    return apiError("Product not found.", 404);
  }

  return apiSuccess("Product fetched successfully", result.data);
}
