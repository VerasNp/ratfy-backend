import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'

export class RemoveFavoriteTrackUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(dto: { userId: string; trackId: string }): Promise<void> {
    await this.favoriteRepository.remove(dto.userId, dto.trackId, 'TRACK')
  }
}
