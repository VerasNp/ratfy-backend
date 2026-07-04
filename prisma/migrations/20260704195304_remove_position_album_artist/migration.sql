/*
  Warnings:

  - You are about to drop the column `position` on the `AlbumArtist` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `AlbumArtist` table. All the data in the column will be lost.
  - You are about to drop the column `albumId` on the `Artist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AlbumArtist" DROP COLUMN "position",
DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "albumId";
