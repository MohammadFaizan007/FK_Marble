import { connection } from "next/server";
import { ZodError } from "zod";
import { apiError, apiSuccess, rethrowIfPrerender, zodErrorResponse } from "@/lib/api-response";
import { parseProductListQuery } from "@/lib/catalogue-query";
import { getCategoryBySlug, getProductsByCategory } from "@/services/product-service";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  await connection();
  const { slug } = await context.params;
  const category = await getCategoryBySlug(slug);

  if (!category.ok) {
    return apiError(category.message, 503);
  }

  if (!category.data) {
    return apiError("Category not found.", 404);
  }

  try {
    const query = parseProductListQuery(new URL(request.url).searchParams);
    const products = await getProductsByCategory(category.data.slug, query);

    if (!products.ok) {
      return apiError(products.message, 503);
    }

    return apiSuccess(
      "Category fetched successfully",
      { category: category.data, products: products.data.items },
      products.data.meta,
    );
  } catch (error) {
    rethrowIfPrerender(error);

    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    console.error("Category request failed.");
    return apiError("Something went wrong", 500);
  }
}
