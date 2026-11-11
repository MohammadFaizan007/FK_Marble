import type { AdminRole } from "@/generated/prisma/client";
import { apiError } from "@/lib/api-response";
import { hasPermission } from "@/lib/permissions";
import { DocumentNotFoundError, DocumentStateError } from "@/services/admin-documents";

export function draftDocumentPermission(role: AdminRole) {
  if (hasPermission(role, "sales.create")) {
    return "sales.create" as const;
  }

  if (hasPermission(role, "invoice.issue")) {
    return "invoice.issue" as const;
  }

  return null;
}

export function documentFailure(error: unknown) {
  if (error instanceof DocumentNotFoundError) {
    return apiError(error.message, 404);
  }

  if (error instanceof DocumentStateError) {
    return apiError(error.message, 400);
  }

  return null;
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
