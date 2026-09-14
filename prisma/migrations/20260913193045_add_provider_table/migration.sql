-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "integrationType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "revenueShare" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "configPublic" JSONB,
    "configSecret" TEXT,
    "kycRequired" BOOLEAN NOT NULL DEFAULT false,
    "minPayout" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Provider_enabled_status_idx" ON "Provider"("enabled", "status");
