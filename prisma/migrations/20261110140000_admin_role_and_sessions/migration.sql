CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'SALES', 'PURCHASE', 'INVENTORY', 'ACCOUNTANT');

ALTER TABLE "AdminUser" ADD COLUMN "role" "AdminRole" NOT NULL;

CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_userId_expiresAt_idx" ON "AdminSession"("userId", "expiresAt");

ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
