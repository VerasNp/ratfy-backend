import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'

import type { PrismaClient, FavoriteEntityType } from '../../../prisma/generated/prisma/client'

class FavoriteRepositoryPrisma implements FavoriteRepository {
  constructor(private readonly orm: PrismaClient) {}

  async add(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    await this.orm.favorite.upsert({
      create: { userId, entityId, entityType },
      update: {},
      where: {
        userId_entityId_entityType: { userId, entityId, entityType },
      },
    })
  }

  async remove(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    await this.orm.favorite.deleteMany({
      where: { userId, entityId, entityType },
    })
  }

  async findEntityIdsByUserAndType(userId: string, entityType: FavoriteEntityType): Promise<string[]> {
    const rows = await this.orm.favorite.findMany({
      select: { entityId: true },
      where: { userId, entityType },
    })
    return rows.map((row) => row.entityId)
  }

  async isFavorited(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<boolean> {
    const row = await this.orm.favorite.findUnique({
      where: {
        userId_entityId_entityType: { userId, entityId, entityType },
      },
    })
    return row !== null
  }

  async removeAllByEntity(entityId: string, entityType: FavoriteEntityType): Promise<void> {
    await this.orm.favorite.deleteMany({
      where: { entityId, entityType },
    })
  }
}

export default FavoriteRepositoryPrisma
