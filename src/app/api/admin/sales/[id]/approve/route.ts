import { apiError, apiSuccess } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { approveSalesOrder, SalesOrderNotFoundError, SalesOrderStateError } from "@/services/admin-sales";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const result = await withAdminWrite(request, "sales.approve", async (db) => {
      const order = await approveSalesOrder(db, id);
      return {
        value: order,
        audit: {
          action: "sales.approve",
          entityType: "SalesOrder",
          entityId: order.id,
          summary: "Approved a sales order",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Sales order approved", result.value);
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
