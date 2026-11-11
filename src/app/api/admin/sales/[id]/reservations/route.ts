import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { salesReserveInputSchema } from "@/lib/sales-schema";
import { reserveSalesGoods, SalesOrderNotFoundError, SalesOrderStateError } from "@/services/admin-sales";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = salesReserveInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const order = await reserveSalesGoods(db, id, parsed.data);
      return {
        value: order,
        audit: {
          action: "sales.reserve",
          entityType: "SalesOrder",
          entityId: order.id,
          summary: "Reserved goods for a sales order",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Goods reserved", result.value);
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

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
