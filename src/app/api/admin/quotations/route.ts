import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { withAdminWrite } from "@/lib/admin-guard";
import { documentFailure, readJson } from "@/lib/document-http";
import { quotationInputSchema } from "@/lib/document-schema";
import { getPrisma } from "@/lib/prisma";
import { createQuotation, documentAccess, listQuotations, listTotal } from "@/services/admin-documents";

export async function GET(request: Request) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!documentAccess(profile.role).viewQuotes) {
    return apiError("You do not have permission for this action.", 403);
  }

  const quotes = await listQuotations(getPrisma());
  return apiSuccess(
    "Quotations fetched successfully",
    quotes.map((quote) => ({
      id: quote.id,
      number: quote.number,
      revision: quote.revision,
      status: quote.status,
      customerName: quote.customer.name,
      total: listTotal(quote.items),
      createdAt: quote.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  const parsed = quotationInputSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const quote = await createQuotation(db, parsed.data);
      return {
        value: quote,
        audit: { action: "quotation.create", entityType: "Quotation", entityId: quote.id, summary: "Added a quotation" },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Quotation added", result.value, {}, 201);
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}
