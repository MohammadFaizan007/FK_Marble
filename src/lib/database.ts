const placeholder = "USER:PASSWORD@HOST";

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    return false;
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    return false;
  }

  return !url.includes(placeholder);
}

export const databaseSetupMessage =
  "PostgreSQL is not configured. Add DATABASE_URL to .env, run npx prisma migrate deploy, then run npx prisma db seed. The setup steps are in README.md.";

export const databaseUnavailableMessage =
  "The catalogue database could not be reached. Check that PostgreSQL is running and that DATABASE_URL is correct.";
