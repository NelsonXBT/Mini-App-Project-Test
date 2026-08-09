-- CreateEnum
CREATE TYPE "public"."ResourceSection" AS ENUM ('packs', 'tools');

-- CreateEnum
CREATE TYPE "public"."NotificationAudience" AS ENUM ('ALL', 'COURSE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ActivityType" ADD VALUE 'COMMUNITY_CHANNEL_CREATED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'COMMUNITY_CHANNEL_UPDATED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'COMMUNITY_CHANNEL_DELETED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'RESOURCE_ITEM_CREATED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'RESOURCE_ITEM_UPDATED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'RESOURCE_ITEM_DELETED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'NOTIFICATION_CREATED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'NOTIFICATION_UPDATED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'NOTIFICATION_DELETED';

-- AlterTable
ALTER TABLE "public"."PlatformSettings" ALTER COLUMN "platformName" SET DEFAULT 'Nadi Academy';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "notificationsSeenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."CommunityChannel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'community',
    "cta" TEXT NOT NULL DEFAULT 'Open',
    "url" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResourceItem" (
    "id" TEXT NOT NULL,
    "section" "public"."ResourceSection" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "cta" TEXT NOT NULL DEFAULT 'Browse',
    "url" TEXT NOT NULL,
    "fileCount" INTEGER,
    "isAffiliate" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" "public"."NotificationAudience" NOT NULL DEFAULT 'ALL',
    "courseId" TEXT,
    "linkUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityChannel_sortOrder_idx" ON "public"."CommunityChannel"("sortOrder");

-- CreateIndex
CREATE INDEX "ResourceItem_section_sortOrder_idx" ON "public"."ResourceItem"("section", "sortOrder");

-- CreateIndex
CREATE INDEX "Notification_publishedAt_idx" ON "public"."Notification"("publishedAt");

-- CreateIndex
CREATE INDEX "Notification_courseId_idx" ON "public"."Notification"("courseId");

-- CreateIndex
CREATE INDEX "Notification_actorId_idx" ON "public"."Notification"("actorId");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
