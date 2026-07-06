import type { StoragePort } from '#application/ports/StoragePort.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

export class DeletePlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
	private readonly favoriteRepository: FavoriteRepository,
    private readonly storageService: StoragePort,
    private readonly bucketImages: string,
  ) {}

  async execute(dto: Input): Promise<void> {
    const playlist = await this.playlistRepository.findById(dto.id)
    if (!playlist) throw new PlaylistNotFoundError(dto.id)

    if (playlist.coverImageKey) {
      await this.storageService.delete(this.bucketImages, playlist.coverImageKey)
    }

    await this.playlistRepository.delete(dto.id)
    await this.favoriteRepository.removeAllByEntity(dto.id, 'PLAYLIST')
  }
}

type Input = {
  id: string
}
