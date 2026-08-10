-- AlterTable
ALTER TABLE "public"."BroadcastDelivery" ADD COLUMN     "retryable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."BroadcastMessage" ADD COLUMN     "lockedAt" TIMESTAMP(3);

