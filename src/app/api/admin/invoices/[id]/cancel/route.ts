import { apiError, apiSuccess, zodErrorResponse } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { documentFailure, readJson } from "@/lib/document-http";
import { invoiceCancelSchema } from "@/lib/document-schema";
import { cancelInvoice } from "@/services/admin-documents";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const parsed = invoiceCancelSchema.safeParse(await readJson(request));

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const result = await withAdminWrite(request, "invoice.issue", async (db) => {
      const invoice = await cancelInvoice(db, (await params).id, parsed.data.reason);
      return {
        value: invoice,
        audit: { action: "invoice.cancel", entityType: "Invoice", entityId: invoice.id, summary: "Cancelled an invoice" },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Invoice cancelled", result.value);
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}
