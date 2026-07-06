import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'

export class AddFavoritePlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string; playlistId: string }): Promise<void> {
    const playlist = await this.playlistRepository.findById(dto.playlistId)
    if (!playlist) throw new PlaylistNotFoundError(dto.playlistId)

    await this.favoriteRepository.add(dto.userId, dto.playlistId, 'PLAYLIST')
  }
}
