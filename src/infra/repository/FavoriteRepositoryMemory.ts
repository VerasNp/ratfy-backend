import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'

type FavoriteEntry = { userId: string; entityId: string; entityType: 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST' }

class FavoriteRepositoryMemory implements FavoriteRepository {
  public favorites: FavoriteEntry[]

  public constructor(initialFavorites: FavoriteEntry[] = []) {
    this.favorites = initialFavorites
  }

  public add(userId: string, entityId: string, entityType: 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'): Promise<void> {
    const exists = this.favorites.some(
      (f) => f.userId === userId && f.entityId === entityId && f.entityType === entityType,
    )
    if (!exists) {
      this.favorites.push({ userId, entityId, entityType })
    }
    return Promise.resolve()
  }

  public remove(userId: string, entityId: string, entityType: 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'): Promise<void> {
    this.favorites = this.favorites.filter(
      (f) => !(f.userId === userId && f.entityId === entityId && f.entityType === entityType),
    )
    return Promise.resolve()
  }

  public findEntityIdsByUserAndType(userId: string, entityType: 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'): Promise<string[]> {
    return Promise.resolve(
      this.favorites
        .filter((f) => f.userId === userId && f.entityType === entityType)
        .map((f) => f.entityId),
    )
  }

  public isFavorited(userId: string, entityId: string, entityType: 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'): Promise<boolean> {
    return Promise.resolve(
      this.favorites.some(
        (f) => f.userId === userId && f.entityId === entityId && f.entityType === entityType,
      ),
    )
  }

  public removeAllByEntity(entityId: string, entityType: 'TRACK' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'): Promise<void> {
    this.favorites = this.favorites.filter(
      (f) => !(f.entityId === entityId && f.entityType === entityType),
    )
    return Promise.resolve()
  }
}

export default FavoriteRepositoryMemory
