-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DECIMAL(65,30);
