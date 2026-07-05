import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'

type FavoriteEntityType = 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'

class FavoriteRepositoryMemory implements FavoriteRepository {
  private favorites: { userId: string; entityId: string; entityType: FavoriteEntityType }[] = []

  async add(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    const exists = this.favorites.some(
      (f) => f.userId === userId && f.entityId === entityId && f.entityType === entityType,
    )
    if (!exists) {
      this.favorites.push({ userId, entityId, entityType })
    }
  }

  async remove(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<void> {
    this.favorites = this.favorites.filter(
      (f) => !(f.userId === userId && f.entityId === entityId && f.entityType === entityType),
    )
  }

  async findEntityIdsByUserAndType(userId: string, entityType: FavoriteEntityType): Promise<string[]> {
    return this.favorites
      .filter((f) => f.userId === userId && f.entityType === entityType)
      .map((f) => f.entityId)
  }

  async isFavorited(userId: string, entityId: string, entityType: FavoriteEntityType): Promise<boolean> {
    return this.favorites.some(
      (f) => f.userId === userId && f.entityId === entityId && f.entityType === entityType,
    )
  }

  async removeAllByEntity(entityId: string, entityType: FavoriteEntityType): Promise<void> {
    this.favorites = this.favorites.filter(
      (f) => !(f.entityId === entityId && f.entityType === entityType),
    )
  }
}

export default FavoriteRepositoryMemory
