import { apiError, apiSuccess } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { getPurchaseOrder } from "@/services/admin-purchases";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!hasPermission(profile.role, "purchase.create") && !hasPermission(profile.role, "purchase.approve")) {
    return apiError("You do not have permission for this action.", 403);
  }

  const { id } = await context.params;
  const order = await getPurchaseOrder(getPrisma(), id);

  if (!order) {
    return apiError("Purchase order not found.", 404);
  }

  return apiSuccess("Purchase order fetched successfully", order);
}
