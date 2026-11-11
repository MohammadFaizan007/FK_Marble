import { z } from "zod";
import type { AdminRole } from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit-log";
import { createSessionToken, hashSessionToken, sessionExpiry } from "@/lib/admin-session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";

const minimumPasswordLength = 12;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().max(160),
  password: z.string().min(1, "Enter your password.").max(200),
});

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

let paddingHash: Promise<string> | null = null;

function passwordPadding(): Promise<string> {
  paddingHash ??= hashPassword("timing-padding-value");
  return paddingHash;
}

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<{ ok: true; profile: AdminProfile; token: string; expiresAt: Date } | { ok: false }> {
  const prisma = getPrisma();
  const user = await prisma.adminUser.findUnique({
    where: { email: normalizeAdminEmail(email) },
  });
  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? (await passwordPadding()));

  if (!user || !user.isActive || !passwordMatches) {
    return { ok: false };
  }

  const token = createSessionToken();
  const expiresAt = sessionExpiry();

  await prisma.$transaction(async (db) => {
    const session = await db.adminSession.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt,
      },
    });
    await writeAuditLog(db, {
      actorId: user.id,
      action: "session.login",
      entityType: "AdminSession",
      entityId: session.id,
      summary: "Staff signed in",
    });
  });

  return {
    ok: true,
    token,
    expiresAt,
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function readAdminSession(token: string | null): Promise<AdminProfile | null> {
  if (!token) {
    return null;
  }

  const session = await getPrisma().adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.isActive) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function revokeAdminSession(token: string | null): Promise<void> {
  if (!token) {
    return;
  }

  const prisma = getPrisma();
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
  });

  if (!session || session.revokedAt) {
    return;
  }

  await prisma.$transaction(async (db) => {
    const revoked = await db.adminSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (revoked.count !== 1) {
      return;
    }

    await writeAuditLog(db, {
      actorId: session.userId,
      action: "session.logout",
      entityType: "AdminSession",
      entityId: session.id,
      summary: "Staff signed out",
    });
  });
}

export async function createOwnerAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const name = input.name.trim();
  const email = normalizeAdminEmail(input.email);
  const password = input.password;

  if (name.length < 2) {
    return { ok: false, message: "Enter the owner's name." };
  }

  if (!z.email().safeParse(email).success) {
    return { ok: false, message: "Enter a valid owner email." };
  }

  if (password.length < minimumPasswordLength) {
    return { ok: false, message: `Use a password of at least ${minimumPasswordLength} characters.` };
  }

  const prisma = getPrisma();
  const existingOwner = await prisma.adminUser.findFirst({ where: { role: "OWNER" }, select: { id: true } });

  if (existingOwner) {
    return { ok: false, message: "An owner account already exists." };
  }

  const existingEmail = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });

  if (existingEmail) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (db) => {
    const owner = await db.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: "OWNER",
        isActive: true,
      },
    });
    await writeAuditLog(db, {
      actorId: owner.id,
      action: "user.create",
      entityType: "AdminUser",
      entityId: owner.id,
      summary: "Owner account created",
    });
  });

  return { ok: true };
}
