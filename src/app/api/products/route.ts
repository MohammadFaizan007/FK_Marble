import { connection } from "next/server";
import { ZodError } from "zod";
import { apiError, apiSuccess, rethrowIfPrerender, zodErrorResponse } from "@/lib/api-response";
import { parseProductListQuery } from "@/lib/catalogue-query";
import { getProducts } from "@/services/product-service";

export async function GET(request: Request) {
  await connection();

  try {
    const query = parseProductListQuery(new URL(request.url).searchParams);
    const result = await getProducts(query);

    if (!result.ok) {
      return apiError(result.message, 503);
    }

    return apiSuccess("Products fetched successfully", result.data.items, result.data.meta);
  } catch (error) {
    rethrowIfPrerender(error);

    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    console.error("Product list request failed.");
    return apiError("Something went wrong", 500);
  }
}
