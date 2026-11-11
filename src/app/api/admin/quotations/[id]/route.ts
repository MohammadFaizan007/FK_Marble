import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { documentFailure, readJson } from "@/lib/document-http";
import { quotationInputSchema, quotationStatusSchema } from "@/lib/document-schema";
import { getPrisma } from "@/lib/prisma";
import { deleteQuotation, documentAccess, getQuotation, setQuotationStatus, updateQuotation } from "@/services/admin-documents";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!documentAccess(profile.role).viewQuotes) {
    return apiError("You do not have permission for this action.", 403);
  }

  const quote = await getQuotation(getPrisma(), (await params).id);

  if (!quote) {
    return apiError("Quotation not found.", 404);
  }

  return apiSuccess("Quotation fetched successfully", quote);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const body = await readJson(request);
  const statusParsed = quotationStatusSchema.safeParse(body);
  const draftParsed = quotationInputSchema.safeParse(body);

  if (!statusParsed.success && !draftParsed.success) {
    return zodErrorResponse(draftParsed.success ? statusParsed.error : draftParsed.error);
  }

  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const id = (await params).id;
      const quote = statusParsed.success
        ? await setQuotationStatus(db, id, statusParsed.data.status)
        : await updateQuotation(db, id, draftParsed.data!);
      return {
        value: quote,
        audit: { action: "quotation.update", entityType: "Quotation", entityId: quote.id, summary: "Updated a quotation" },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Quotation updated", result.value);
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const id = await deleteQuotation(db, (await params).id);
      return {
        value: id,
        audit: { action: "quotation.delete", entityType: "Quotation", entityId: id, summary: "Removed a quotation" },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Quotation removed", { id: result.value });
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}
