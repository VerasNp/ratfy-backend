import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'

export class RemoveFavoritePlaylistUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(dto: { userId: string; playlistId: string }): Promise<void> {
    await this.favoriteRepository.remove(dto.userId, dto.playlistId, 'PLAYLIST')
  }
}
