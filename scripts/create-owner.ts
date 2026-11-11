import { createOwnerAccount } from "../src/lib/admin-auth";
import { getPrisma } from "../src/lib/prisma";

async function main() {
  const result = await createOwnerAccount({
    name: process.env.ADMIN_OWNER_NAME ?? "",
    email: process.env.ADMIN_OWNER_EMAIL ?? "",
    password: process.env.ADMIN_OWNER_PASSWORD ?? "",
  });

  if (!result.ok) {
    console.error(result.message);
    process.exitCode = 1;
    return;
  }

  console.log("Owner account created.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Owner account could not be created.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect().catch(() => undefined);
  });
