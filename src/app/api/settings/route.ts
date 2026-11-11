import { apiError, apiSuccess } from "@/lib/api-response";
import { getBusinessSettings } from "@/services/product-service";

export async function GET() {
  const result = await getBusinessSettings();

  if (!result.ok) {
    return apiError(result.message, 503);
  }

  if (!result.data) {
    return apiError("Business settings have not been saved yet.", 404);
  }

  return apiSuccess("Business settings fetched successfully", result.data);
}
