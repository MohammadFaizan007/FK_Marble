import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { readAdminSession, type AdminProfile } from "@/lib/admin-auth";
import { adminSessionCookieName } from "@/lib/admin-session";
import { databaseUnavailableMessage } from "@/lib/database";

export async function loadStaffPage(): Promise<{ ok: true; profile: AdminProfile } | { ok: false; message: string }> {
  await connection();
  const token = (await cookies()).get(adminSessionCookieName)?.value ?? null;

  try {
    const profile = await readAdminSession(token);

    if (!profile) {
      redirect("/admin/login");
    }

    return { ok: true, profile };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false, message: databaseUnavailableMessage };
  }
}
