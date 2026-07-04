import type { FavoriteEntityType } from '../../../prisma/generated/prisma/client'

export interface FavoriteRepository {
  add(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void>
  remove(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void>
  findEntityIdsByUserAndType(userId: string, entityType: FavoriteEntityType): Promise<string[]>
  isFavorited(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<boolean>
  removeAllByEntity(entityId: string, entityType: FavoriteEntityType): Promise<void>
}
