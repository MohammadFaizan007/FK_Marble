import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { customerInputSchema } from "@/lib/customer-schema";
import { hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { createCustomer, listCustomers } from "@/services/admin-customers";

export async function GET(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!hasPermission(profile.role, "sales.create") && !hasPermission(profile.role, "sales.approve")) {
    return apiError("You do not have permission for this action.", 403);
  }

  return apiSuccess("Customers fetched successfully", await listCustomers(getPrisma()));
}

export async function POST(request: Request) {
  const parsed = customerInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const result = await withAdminWrite(request, "sales.create", async (db) => {
    const customer = await createCustomer(db, parsed.data);
    return {
      value: customer,
      audit: {
        action: "customer.create",
        entityType: "Customer",
        entityId: customer.id,
        summary: "Added a customer",
      },
    };
  });

  if (!result.ok) {
    return apiError(result.message, result.status);
  }

  return apiSuccess("Customer added", result.value, {}, 201);
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
