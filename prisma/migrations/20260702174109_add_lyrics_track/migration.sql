-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lyrics" TEXT;
