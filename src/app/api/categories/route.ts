import { apiError, apiSuccess } from "@/lib/api-response";
import { getCategories } from "@/services/product-service";

export async function GET() {
  const result = await getCategories();

  if (!result.ok) {
    return apiError(result.message, 503);
  }

  return apiSuccess("Categories fetched successfully", result.data, {
    total: result.data.length,
  });
}
