-- AlterTable
ALTER TABLE "public"."LessonProgress" ADD COLUMN     "currentTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastWatchedAt" TIMESTAMP(3),
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;
