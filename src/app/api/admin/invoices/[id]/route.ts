import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { documentFailure, draftDocumentPermission, readJson } from "@/lib/document-http";
import { invoiceInputSchema } from "@/lib/document-schema";
import { getPrisma } from "@/lib/prisma";
import { deleteInvoice, documentAccess, getInvoice, updateInvoice } from "@/services/admin-documents";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!documentAccess(profile.role).viewInvoices) {
    return apiError("You do not have permission for this action.", 403);
  }

  const invoice = await getInvoice(getPrisma(), (await params).id);

  if (!invoice) {
    return apiError("Invoice not found.", 404);
  }

  return apiSuccess("Invoice fetched successfully", invoice);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const parsed = invoiceInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const profile = await readAdminSession(readSessionToken(request));
  const permission = profile ? draftDocumentPermission(profile.role) : null;

  if (!profile || !permission) {
    return apiError(profile ? "You do not have permission for this action." : "Sign in required.", profile ? 403 : 401);
  }

  try {
    const result = await withAdminWrite(request, permission, async (db) => {
      const invoice = await updateInvoice(db, (await params).id, parsed.data);
      return {
        value: invoice,
        audit: { action: "invoice.update", entityType: "Invoice", entityId: invoice.id, summary: "Updated an invoice" },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Invoice updated", result.value);
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const profile = await readAdminSession(readSessionToken(request));
  const permission = profile ? draftDocumentPermission(profile.role) : null;

  if (!profile || !permission) {
    return apiError(profile ? "You do not have permission for this action." : "Sign in required.", profile ? 403 : 401);
  }

  try {
    const result = await withAdminWrite(request, permission, async (db) => {
      const id = await deleteInvoice(db, (await params).id);
      return {
        value: id,
        audit: { action: "invoice.delete", entityType: "Invoice", entityId: id, summary: "Removed an invoice" },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Invoice removed", { id: result.value });
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}
