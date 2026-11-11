import { apiError, apiSuccess } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { hasPermission, type AdminPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { cancelSalesOrder, SalesOrderNotFoundError, SalesOrderStateError } from "@/services/admin-sales";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  const existing = await getPrisma().salesOrder.findUnique({ where: { id }, select: { status: true } });

  if (!existing) {
    return apiError("Sales order not found.", 404);
  }

  const permission: AdminPermission = existing.status === "APPROVED" ? "sales.approve" : "sales.create";

  if (!hasPermission(profile.role, permission)) {
    return apiError("You do not have permission for this action.", 403);
  }

  try {
    const result = await withAdminWrite(request, permission, async (db) => {
      const order = await cancelSalesOrder(db, id);
      return {
        value: order,
        audit: {
          action: "sales.cancel",
          entityType: "SalesOrder",
          entityId: order.id,
          summary: "Cancelled a sales order",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Sales order cancelled", result.value);
  } catch (error) {
    if (error instanceof SalesOrderNotFoundError) {
      return apiError(error.message, 404);
    }

    if (error instanceof SalesOrderStateError) {
      return apiError(error.message, 400);
    }

    throw error;
  }
}
