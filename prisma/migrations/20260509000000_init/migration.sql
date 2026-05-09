-- Baseline migration — Supabase MCP üzerinden 2026-05-09'da uygulandı.
-- Prisma'nın gelecekteki migrate dev/deploy çağrılarıyla senkron olması için.

-- ─── Enums ────────────────────────────────────────────
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

CREATE TYPE "WarFrequency" AS ENUM (
  'ALWAYS',
  'MORE_THAN_ONCE_PER_WEEK',
  'ONCE_PER_WEEK',
  'LESS_THAN_ONCE_PER_WEEK',
  'NEVER',
  'ANY',
  'UNKNOWN'
);

CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED', 'BANNED');
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_INFO', 'SCAM', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- ─── Users ────────────────────────────────────────────
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "username" TEXT NOT NULL UNIQUE,
  "discordId" TEXT UNIQUE,
  "cocPlayerTag" TEXT UNIQUE,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "discordWebhookUrl" TEXT
);

-- ─── ClanListing ──────────────────────────────────────
CREATE TABLE "ClanListing" (
  "id" TEXT PRIMARY KEY,
  "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "clanTag" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "description" TEXT,
  "trophies" INTEGER NOT NULL,
  "warFrequency" "WarFrequency" NOT NULL,
  "warWinStreak" INTEGER NOT NULL,
  "warWins" INTEGER NOT NULL,
  "memberCount" INTEGER NOT NULL,
  "requiredTH" INTEGER NOT NULL,
  "requiredTrophies" INTEGER NOT NULL,
  "badgeUrl" TEXT,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL,
  "customDescription" TEXT,
  "language" TEXT NOT NULL DEFAULT 'tr',
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  "activeHours" TEXT,
  "discordInvite" TEXT,
  "whatsappLink" TEXT,
  "telegramLink" TEXT,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
  "bumpedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "verificationCode" TEXT,
  "verificationExpiresAt" TIMESTAMP(3),
  "boostedUntil" TIMESTAMP(3)
);

CREATE INDEX "ClanListing_status_bumpedAt_idx" ON "ClanListing"("status", "bumpedAt");
CREATE INDEX "ClanListing_requiredTH_idx" ON "ClanListing"("requiredTH");

-- ─── PlayerListing ────────────────────────────────────
CREATE TABLE "PlayerListing" (
  "id" TEXT PRIMARY KEY,
  "ownerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "cocPlayerTag" TEXT UNIQUE,
  "ingameName" TEXT NOT NULL,
  "thLevel" INTEGER NOT NULL,
  "trophies" INTEGER NOT NULL,
  "heroLevels" JSONB,
  "bio" TEXT,
  "preferredWarFreq" "WarFrequency" NOT NULL,
  "preferredLanguage" TEXT NOT NULL DEFAULT 'tr',
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  "activeHours" TEXT,
  "lookingFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
  "bumpedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "PlayerListing_status_bumpedAt_idx" ON "PlayerListing"("status", "bumpedAt");
CREATE INDEX "PlayerListing_thLevel_idx" ON "PlayerListing"("thLevel");

-- ─── Application ──────────────────────────────────────
CREATE TABLE "Application" (
  "id" TEXT PRIMARY KEY,
  "applicantId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "clanListingId" TEXT NOT NULL REFERENCES "ClanListing"("id") ON DELETE CASCADE,
  "message" TEXT NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Application_applicantId_clanListingId_key" UNIQUE ("applicantId", "clanListingId")
);

CREATE INDEX "Application_clanListingId_status_idx" ON "Application"("clanListingId", "status");

-- ─── Report ───────────────────────────────────────────
CREATE TABLE "Report" (
  "id" TEXT PRIMARY KEY,
  "reporterId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "clanListingId" TEXT REFERENCES "ClanListing"("id") ON DELETE SET NULL,
  "playerListingId" TEXT REFERENCES "PlayerListing"("id") ON DELETE SET NULL,
  "reason" "ReportReason" NOT NULL,
  "details" TEXT,
  "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3)
);

CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- ─── RLS + Data API kilidi ────────────────────────────
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClanListing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlayerListing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "User" FROM anon, authenticated;
REVOKE ALL ON "ClanListing" FROM anon, authenticated;
REVOKE ALL ON "PlayerListing" FROM anon, authenticated;
REVOKE ALL ON "Application" FROM anon, authenticated;
REVOKE ALL ON "Report" FROM anon, authenticated;
