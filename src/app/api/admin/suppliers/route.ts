import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";
import { supplierInputSchema } from "@/lib/supplier-schema";
import { createSupplier, listSuppliers } from "@/services/admin-suppliers";

export async function GET(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!hasPermission(profile.role, "supplier.view")) {
    return apiError("You do not have permission for this action.", 403);
  }

  const suppliers = await listSuppliers(getPrisma());
  return apiSuccess("Suppliers fetched successfully", suppliers);
}

export async function POST(request: Request) {
  const parsed = supplierInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const result = await withAdminWrite(request, "supplier.update", async (db) => {
    const supplier = await createSupplier(db, parsed.data);
    return {
      value: supplier,
      audit: {
        action: "supplier.create",
        entityType: "Supplier",
        entityId: supplier.id,
        summary: "Added a supplier",
      },
    };
  });

  if (!result.ok) {
    return apiError(result.message, result.status);
  }

  return apiSuccess("Supplier added", result.value, {}, 201);
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
