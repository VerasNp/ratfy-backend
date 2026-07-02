-- CreateEnum
CREATE TYPE "FavoriteEntityType" AS ENUM ('TRACK', 'ALBUM', 'ARTIST', 'PLAYLIST');

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "FavoriteEntityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_entityType_idx" ON "Favorite"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_entityId_entityType_key" ON "Favorite"("userId", "entityId", "entityType");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
