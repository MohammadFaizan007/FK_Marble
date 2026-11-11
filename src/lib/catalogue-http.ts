import { CatalogueAccessError, CatalogueNotFoundError, CategoryInUseError, ProductInUseError } from "@/services/admin-catalogue";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { apiError } from "@/lib/api-response";
import { catalogueAccess } from "@/services/admin-catalogue";

export async function requireCatalogueView(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return { ok: false as const, response: apiError("Sign in required.", 401) };
  }

  const access = catalogueAccess(profile.role);

  if (!access.view) {
    return { ok: false as const, response: apiError("You do not have permission for this action.", 403) };
  }

  return { ok: true as const, profile, access };
}

export function catalogueFailure(error: unknown) {
  if (error instanceof CatalogueAccessError) {
    return apiError(error.message, 403);
  }

  if (error instanceof CatalogueNotFoundError) {
    return apiError(error.message, 404);
  }

  if (error instanceof ProductInUseError || error instanceof CategoryInUseError) {
    return apiError(error.message, 400);
  }

  if (error instanceof Error && (error.message === "This slug is already used." || error.message === "Choose a category.")) {
    return apiError(error.message, 400);
  }

  return null;
}
