import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { customerInputSchema } from "@/lib/customer-schema";
import { CustomerInUseError, CustomerNotFoundError, deleteCustomer, updateCustomer } from "@/services/admin-customers";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = customerInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const customer = await updateCustomer(db, id, parsed.data);

      if (!customer) {
        throw new CustomerNotFoundError();
      }

      return {
        value: customer,
        audit: {
          action: "customer.update",
          entityType: "Customer",
          entityId: customer.id,
          summary: "Updated a customer",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Customer updated", result.value);
  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      return apiError(error.message, 404);
    }

    throw error;
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const customerId = await deleteCustomer(db, id);

      if (!customerId) {
        throw new CustomerNotFoundError();
      }

      return {
        value: { id: customerId },
        audit: {
          action: "customer.delete",
          entityType: "Customer",
          entityId: customerId,
          summary: "Removed a customer",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Customer removed", result.value);
  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      return apiError(error.message, 404);
    }

    if (error instanceof CustomerInUseError) {
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
