/*
  Warnings:

  - You are about to drop the column `artistIds` on the `Album` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Album" DROP COLUMN "artistIds",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "albumId" TEXT;

-- CreateTable
CREATE TABLE "AlbumArtist" (
    "albumId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AlbumArtist_pkey" PRIMARY KEY ("albumId","artistId")
);

-- CreateIndex
CREATE INDEX "AlbumArtist_artistId_idx" ON "AlbumArtist"("artistId");

-- AddForeignKey
ALTER TABLE "AlbumArtist" ADD CONSTRAINT "AlbumArtist_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumArtist" ADD CONSTRAINT "AlbumArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
