import { apiError, apiSuccess } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { documentFailure } from "@/lib/document-http";
import { issueInvoice } from "@/services/admin-documents";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const result = await withAdminWrite(request, "invoice.issue", async (db) => {
      const invoice = await issueInvoice(db, (await params).id);
      return {
        value: invoice,
        audit: { action: "invoice.issue", entityType: "Invoice", entityId: invoice.id, summary: "Issued an invoice" },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Invoice issued", result.value);
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}
