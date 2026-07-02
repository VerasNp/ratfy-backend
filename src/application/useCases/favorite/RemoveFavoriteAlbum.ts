import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'

export class RemoveFavoriteAlbumUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(dto: { userId: string; albumId: string }): Promise<void> {
    await this.favoriteRepository.remove(dto.userId, dto.albumId, 'ALBUM')
  }
}
