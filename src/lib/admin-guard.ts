import type { Prisma } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit-log";
import { readAdminSession, type AdminProfile } from "@/lib/admin-auth";
import { readSessionToken } from "@/lib/admin-session";
import type { AdminPermission } from "@/lib/permissions";
import { hasPermission } from "@/lib/permissions";
import { getPrisma } from "@/lib/prisma";

export type AdminWriteAudit = {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
};

export async function withAdminWrite<T>(
  request: Request,
  permission: AdminPermission,
  write: (db: Prisma.TransactionClient, actor: AdminProfile) => Promise<{ value: T; audit: AdminWriteAudit }>,
): Promise<{ ok: true; value: T } | { ok: false; status: 401 | 403; message: string }> {
  const profile = await readAdminSession(readSessionToken(request));

  if (!profile) {
    return { ok: false, status: 401, message: "Sign in required." };
  }

  if (!hasPermission(profile.role, permission)) {
    return { ok: false, status: 403, message: "You do not have permission for this action." };
  }

  const value = await getPrisma().$transaction(async (db) => {
    const result = await write(db, profile);
    await writeAuditLog(db, {
      actorId: profile.id,
      action: result.audit.action,
      entityType: result.audit.entityType,
      entityId: result.audit.entityId,
      summary: result.audit.summary,
    });
    return result.value;
  });

  return { ok: true, value };
}
