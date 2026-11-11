import { apiError, apiSuccess } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { getSalesOrder } from "@/services/admin-sales";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!hasPermission(profile.role, "sales.create") && !hasPermission(profile.role, "sales.approve")) {
    return apiError("You do not have permission for this action.", 403);
  }

  const { id } = await context.params;
  const order = await getSalesOrder(getPrisma(), id);

  if (!order) {
    return apiError("Sales order not found.", 404);
  }

  return apiSuccess("Sales order fetched successfully", order);
}
