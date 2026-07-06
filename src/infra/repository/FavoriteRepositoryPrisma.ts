import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { TransactionHandle } from '#application/ports/TransactionHandle.js'

import { Prisma, type PrismaClient, type FavoriteEntityType } from '#prisma/client'

class FavoriteRepositoryPrisma implements FavoriteRepository {
  constructor(private readonly orm: PrismaClient) {}

  async add(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    try {
      await this.orm.favorite.upsert({
        create: { userId, entityId, entityType },
        update: {},
        where: {
          userId_entityId_entityType: { userId, entityId, entityType },
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') return
      }
      throw error
    }
  }

  async remove(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    try {
      await this.orm.favorite.deleteMany({
        where: { userId, entityId, entityType },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return
      }
      throw error
    }
  }

  async findEntityIdsByUserAndType(userId: string, entityType: FavoriteEntityType): Promise<string[]> {
    try {
      const rows = await this.orm.favorite.findMany({
        select: { entityId: true },
        where: { userId, entityType },
      })
      return rows.map((row) => row.entityId)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return []
      }
      throw error
    }
  }

  async isFavorited(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<boolean> {
    try {
      const row = await this.orm.favorite.findUnique({
        where: {
          userId_entityId_entityType: { userId, entityId, entityType },
        },
      })
      return row !== null
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return false
      }
      throw error
    }
  }

  async removeAllByEntity(entityId: string, entityType: FavoriteEntityType, tx?: TransactionHandle): Promise<void> {
    const client = tx ? (tx as unknown as Prisma.TransactionClient) : this.orm
    try {
      await client.favorite.deleteMany({
        where: { entityId, entityType },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return
      }
      throw error
    }
  }
}

export default FavoriteRepositoryPrisma
