/*
  Warnings:

  - Added the required column `updatedAt` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramInviteLink" TEXT,
ADD COLUMN     "telegramUsername" TEXT;

-- AlterTable
ALTER TABLE "public"."Enrollment" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
