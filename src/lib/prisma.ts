import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/lib/database";
import "@/lib/load-env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseNotConfiguredError";
  }
}

function poolConfig(url: string) {
  const parsed = new URL(url);
  parsed.searchParams.delete("schema");
  if (parsed.searchParams.get("sslmode") === "require") {
    parsed.searchParams.set("sslmode", "verify-full");
  }

  return {
    connectionString: parsed.toString(),
    connectionTimeoutMillis: 20000,
  };
}

export function getPrisma(): PrismaClient {
  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError();
  }

  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new DatabaseNotConfiguredError();
    }

    const adapter = new PrismaPg(poolConfig(url), { schema: "public" });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}
