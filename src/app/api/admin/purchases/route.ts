import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { purchaseOrderInputSchema } from "@/lib/purchase-schema";
import { hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { createPurchaseOrder, listPurchaseOrders, PurchaseOrderStateError } from "@/services/admin-purchases";

export async function GET(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!hasPermission(profile.role, "purchase.create") && !hasPermission(profile.role, "purchase.approve")) {
    return apiError("You do not have permission for this action.", 403);
  }

  const orders = await listPurchaseOrders(getPrisma());
  return apiSuccess(
    "Purchase orders fetched successfully",
    orders.map((order) => ({
      id: order.id,
      number: order.number,
      status: order.status,
      supplierName: order.supplier.name,
      createdAt: order.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  const parsed = purchaseOrderInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "purchase.create", async (db) => {
      const order = await createPurchaseOrder(db, parsed.data);
      return {
        value: order,
        audit: {
          action: "purchase.create",
          entityType: "PurchaseOrder",
          entityId: order.id,
          summary: "Added a purchase order",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Purchase order added", result.value, {}, 201);
  } catch (error) {
    if (error instanceof PurchaseOrderStateError) {
      return apiError(error.message, 400);
    }

    throw error;
  }
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
