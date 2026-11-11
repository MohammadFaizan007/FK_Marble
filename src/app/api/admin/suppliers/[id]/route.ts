import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { supplierInputSchema } from "@/lib/supplier-schema";
import { deleteSupplier, SupplierInUseError, SupplierNotFoundError, updateSupplier } from "@/services/admin-suppliers";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("The request body must be JSON.", 400);
  }

  const parsed = supplierInputSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "supplier.update", async (db) => {
      const supplier = await updateSupplier(db, id, parsed.data);

      if (!supplier) {
        throw new SupplierNotFoundError();
      }

      return {
        value: supplier,
        audit: {
          action: "supplier.update",
          entityType: "Supplier",
          entityId: supplier.id,
          summary: "Updated a supplier",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Supplier updated", result.value);
  } catch (error) {
    if (error instanceof SupplierNotFoundError) {
      return apiError(error.message, 404);
    }

    throw error;
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const result = await withAdminWrite(request, "supplier.update", async (db) => {
      const supplierId = await deleteSupplier(db, id);

      if (!supplierId) {
        throw new SupplierNotFoundError();
      }

      return {
        value: { id: supplierId },
        audit: {
          action: "supplier.delete",
          entityType: "Supplier",
          entityId: supplierId,
          summary: "Removed a supplier",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Supplier removed", result.value);
  } catch (error) {
    if (error instanceof SupplierNotFoundError) {
      return apiError(error.message, 404);
    }

    if (error instanceof SupplierInUseError) {
      return apiError(error.message, 400);
    }

    throw error;
  }
}
