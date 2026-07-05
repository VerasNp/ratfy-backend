import type { PrismaClient } from '#prisma/client'

type FavoriteEntityType = 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'

export async function createDummyFavoritePrismaORM(
  orm: PrismaClient,
  userId: string,
  entityId: string,
  entityType: FavoriteEntityType,
): Promise<void> {
  await orm.favorite.create({
    data: {
      userId,
      entityId,
      entityType,
    },
  })
}

export function createDummyFavorite(
  userId: string,
  entityId: string,
  entityType: FavoriteEntityType,
): { userId: string; entityId: string; entityType: FavoriteEntityType } {
  return { userId, entityId, entityType }
}
