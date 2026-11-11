import { apiError, apiSuccess } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { hasPermission, type AdminPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { cancelPurchaseOrder, PurchaseOrderNotFoundError, PurchaseOrderStateError } from "@/services/admin-purchases";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  const existing = await getPrisma().purchaseOrder.findUnique({ where: { id }, select: { status: true } });

  if (!existing) {
    return apiError("Purchase order not found.", 404);
  }

  const permission: AdminPermission = existing.status === "APPROVED" ? "purchase.approve" : "purchase.create";

  if (!hasPermission(profile.role, permission)) {
    return apiError("You do not have permission for this action.", 403);
  }

  try {
    const result = await withAdminWrite(request, permission, async (db) => {
      const order = await cancelPurchaseOrder(db, id);
      return {
        value: order,
        audit: {
          action: "purchase.cancel",
          entityType: "PurchaseOrder",
          entityId: order.id,
          summary: "Cancelled a purchase order",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Purchase order cancelled", result.value);
  } catch (error) {
    if (error instanceof PurchaseOrderNotFoundError) {
      return apiError(error.message, 404);
    }

    if (error instanceof PurchaseOrderStateError) {
      return apiError(error.message, 400);
    }

    throw error;
  }
}
