import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { readAdminSession } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import { documentFailure } from "@/lib/document-http";
import { getPrisma } from "@/lib/prisma";
import { documentAccess, invoicePdf } from "@/services/admin-documents";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return apiError("Sign in required.", 401);
  }

  if (!documentAccess(profile.role).viewInvoices) {
    return apiError("You do not have permission for this action.", 403);
  }

  try {
    const file = await invoicePdf(getPrisma(), (await params).id);
    return new NextResponse(Buffer.from(file.body), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    return documentFailure(error) ?? Promise.reject(error);
  }
}
