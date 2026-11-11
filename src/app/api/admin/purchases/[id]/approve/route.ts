import { apiError, apiSuccess } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { approvePurchaseOrder, PurchaseOrderNotFoundError, PurchaseOrderStateError } from "@/services/admin-purchases";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const result = await withAdminWrite(request, "purchase.approve", async (db) => {
      const order = await approvePurchaseOrder(db, id);
      return {
        value: order,
        audit: {
          action: "purchase.approve",
          entityType: "PurchaseOrder",
          entityId: order.id,
          summary: "Approved a purchase order",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Purchase order approved", result.value);
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
