import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { salesDispatchInputSchema } from "@/lib/sales-schema";
import { dispatchSalesGoods, SalesOrderNotFoundError, SalesOrderStateError } from "@/services/admin-sales";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = salesDispatchInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const order = await dispatchSalesGoods(db, id, parsed.data);
      const note = order.dispatches.at(-1);
      return {
        value: order,
        audit: {
          action: "sales.dispatch",
          entityType: "DispatchNote",
          entityId: note?.id ?? order.id,
          summary: "Dispatched goods and updated stock",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Goods dispatched", result.value, {}, 201);
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
