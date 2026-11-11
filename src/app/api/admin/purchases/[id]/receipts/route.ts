import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { goodsReceiptInputSchema } from "@/lib/purchase-schema";
import { PurchaseOrderNotFoundError, PurchaseOrderStateError, receiveGoods } from "@/services/admin-purchases";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = goodsReceiptInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { id } = await context.params;

  try {
    const result = await withAdminWrite(request, "purchase.create", async (db) => {
      const order = await receiveGoods(db, id, parsed.data);
      return {
        value: order,
        audit: {
          action: "purchase.receive",
          entityType: "GoodsReceipt",
          entityId: order.receipts.at(-1)?.id ?? order.id,
          summary: "Received goods and updated stock",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Goods received", result.value, {}, 201);
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

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
