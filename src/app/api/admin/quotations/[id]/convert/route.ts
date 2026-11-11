import { apiError, apiSuccess } from "@/lib/api-response";
import { withAdminWrite } from "@/lib/admin-guard";
import { documentFailure } from "@/lib/document-http";
import { convertQuotation } from "@/services/admin-documents";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const result = await withAdminWrite(request, "sales.create", async (db) => {
      const quote = await convertQuotation(db, (await params).id);
      return {
        value: quote,
        audit: {
          action: "quotation.convert",
          entityType: "Quotation",
          entityId: quote.id,
          summary: "Converted a quotation to a sales order",
        },
      };
    });

    if (!result.ok) {
      return apiError(result.message, result.status);
    }

    return apiSuccess("Quotation converted", result.value, {}, 201);
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}
