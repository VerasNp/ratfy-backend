import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'

export class RemoveFavoriteArtistUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(dto: { userId: string; artistId: string }): Promise<void> {
    await this.favoriteRepository.remove(dto.userId, dto.artistId, 'ARTIST')
  }
}
