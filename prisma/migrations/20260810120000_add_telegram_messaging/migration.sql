-- CreateEnum
CREATE TYPE "public"."BroadcastAudience" AS ENUM ('ALL_ACTIVE_STUDENTS', 'COURSE_ACTIVE_STUDENTS', 'SPECIFIC_STUDENT', 'DESTINATION');

-- CreateEnum
CREATE TYPE "public"."BroadcastStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'PARTIALLY_SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."BroadcastDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."TelegramDestinationType" AS ENUM ('CHANNEL', 'GROUP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ActivityType" ADD VALUE 'BROADCAST_SENT';
ALTER TYPE "public"."ActivityType" ADD VALUE 'TELEGRAM_DESTINATION_CREATED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'TELEGRAM_DESTINATION_UPDATED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'TELEGRAM_DESTINATION_DELETED';

-- CreateTable
CREATE TABLE "public"."TelegramDestination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "type" "public"."TelegramDestinationType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BroadcastMessage" (
    "id" TEXT NOT NULL,
    "audience" "public"."BroadcastAudience" NOT NULL,
    "courseId" TEXT,
    "targetUserId" TEXT,
    "destinationId" TEXT,
    "title" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "imageKey" TEXT,
    "imageMimeType" TEXT,
    "imageSize" INTEGER,
    "buttons" JSONB,
    "status" "public"."BroadcastStatus" NOT NULL DEFAULT 'DRAFT',
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BroadcastMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BroadcastDelivery" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT,
    "chatId" TEXT,
    "status" "public"."BroadcastDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramDestination_chatId_key" ON "public"."TelegramDestination"("chatId");

-- CreateIndex
CREATE INDEX "TelegramDestination_isActive_idx" ON "public"."TelegramDestination"("isActive");

-- CreateIndex
CREATE INDEX "BroadcastMessage_createdAt_idx" ON "public"."BroadcastMessage"("createdAt");

-- CreateIndex
CREATE INDEX "BroadcastMessage_status_idx" ON "public"."BroadcastMessage"("status");

-- CreateIndex
CREATE INDEX "BroadcastMessage_courseId_idx" ON "public"."BroadcastMessage"("courseId");

-- CreateIndex
CREATE INDEX "BroadcastMessage_actorId_idx" ON "public"."BroadcastMessage"("actorId");

-- CreateIndex
CREATE INDEX "BroadcastMessage_targetUserId_idx" ON "public"."BroadcastMessage"("targetUserId");

-- CreateIndex
CREATE INDEX "BroadcastMessage_destinationId_idx" ON "public"."BroadcastMessage"("destinationId");

-- CreateIndex
CREATE INDEX "BroadcastDelivery_messageId_idx" ON "public"."BroadcastDelivery"("messageId");

-- CreateIndex
CREATE INDEX "BroadcastDelivery_status_idx" ON "public"."BroadcastDelivery"("status");

-- CreateIndex
CREATE INDEX "BroadcastDelivery_userId_idx" ON "public"."BroadcastDelivery"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BroadcastDelivery_messageId_chatId_key" ON "public"."BroadcastDelivery"("messageId", "chatId");

-- AddForeignKey
ALTER TABLE "public"."BroadcastMessage" ADD CONSTRAINT "BroadcastMessage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BroadcastMessage" ADD CONSTRAINT "BroadcastMessage_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BroadcastMessage" ADD CONSTRAINT "BroadcastMessage_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "public"."TelegramDestination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BroadcastMessage" ADD CONSTRAINT "BroadcastMessage_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BroadcastDelivery" ADD CONSTRAINT "BroadcastDelivery_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."BroadcastMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BroadcastDelivery" ADD CONSTRAINT "BroadcastDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

