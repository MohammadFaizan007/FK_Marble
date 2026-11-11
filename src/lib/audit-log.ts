export type AuditWriteClient = {
  auditLog: {
    create: (args: {
      data: {
        actorId?: string | null;
        action: string;
        entityType: string;
        entityId?: string | null;
        summary: string;
      };
    }) => Promise<unknown>;
  };
};

export async function writeAuditLog(
  db: AuditWriteClient,
  entry: {
    actorId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    summary: string;
  },
) {
  const summary = entry.summary.trim();

  if (summary.length < 2 || summary.length > 200) {
    throw new Error("Audit summary must be between 2 and 200 characters.");
  }

  await db.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      summary,
    },
  });
}
