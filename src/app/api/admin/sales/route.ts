import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { salesOrderInputSchema } from "@/lib/sales-schema";
import { hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { createSalesOrder, listSalesOrders, SalesOrderStateError } from "@/services/admin-sales";

export async function GET(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!hasPermission(profile.role, "sales.create") && !hasPermission(profile.role, "sales.approve")) {
    return apiError("You do not have permission for this action.", 403);
  }

  const orders = await listSalesOrders(getPrisma());
  return apiSuccess(
    "Sales orders fetched successfully",
    orders.map((order) => ({
      id: order.id,
      number: order.number,
      status: order.status,
      customerName: order.customer.name,
      createdAt: order.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  const parsed = salesOrderInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const order = await createSalesOrder(db, parsed.data);
      return {
        value: order,
        audit: {
          action: "sales.create",
          entityType: "SalesOrder",
          entityId: order.id,
          summary: "Added a sales order",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Sales order added", result.value, {}, 201);
  } catch (error) {
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
