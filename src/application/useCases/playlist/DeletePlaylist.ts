import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

export class DeletePlaylistUseCase {
  constructor(
    private readonly playlistRepo: PlaylistRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: Input): Promise<void> {
    const exists = await this.playlistRepo.findById(dto.id)
    if (!exists) throw new PlaylistNotFoundError(dto.id)

    await this.playlistRepo.delete(dto.id)
    await this.favoriteRepository.removeAllByEntity(dto.id, 'PLAYLIST')
  }
}

type Input = {
  id: string
}