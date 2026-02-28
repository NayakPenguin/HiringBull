-- Manual migration: Add auth provider fields + Otp table
-- Run this in Supabase SQL Editor if prisma migrate dev can't reach the DB

-- 1. Add provider columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "provider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "providerId" TEXT;

-- 2. Add index on provider + providerId
CREATE INDEX IF NOT EXISTS "User_provider_providerId_idx" ON "User"("provider", "providerId");

-- 3. Create Otp table
CREATE TABLE IF NOT EXISTS "Otp" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- 4. Add indexes on Otp
CREATE INDEX IF NOT EXISTS "Otp_email_idx" ON "Otp"("email");
CREATE INDEX IF NOT EXISTS "Otp_email_code_idx" ON "Otp"("email", "code");
