import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { documentFailure, draftDocumentPermission, readJson } from "@/lib/document-http";
import { invoiceInputSchema } from "@/lib/document-schema";
import { getPrisma } from "@/lib/prisma";
import { createInvoice, documentAccess, listInvoices, listTotal } from "@/services/admin-documents";

export async function GET(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!documentAccess(profile.role).viewInvoices) {
    return apiError("You do not have permission for this action.", 403);
  }

  const invoices = await listInvoices(getPrisma());
  return apiSuccess(
    "Invoices fetched successfully",
    invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      customerName: invoice.customer.name,
      total: listTotal(invoice.items),
      createdAt: invoice.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  const parsed = invoiceInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  const permission = draftDocumentPermission(profile.role);

  if (!permission) {
    return apiError("You do not have permission for this action.", 403);
  }

  try {
    const result = await withAdminWrite(request, permission, async (db) => {
      const invoice = await createInvoice(db, parsed.data);
      return {
        value: invoice,
        audit: { action: "invoice.create", entityType: "Invoice", entityId: invoice.id, summary: "Added an invoice" },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Invoice added", result.value, {}, 201);
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}
