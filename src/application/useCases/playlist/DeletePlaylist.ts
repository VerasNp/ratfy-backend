import type { PlaylistDeleteInputDTO } from '#application/DTOs/playlist/PlaylistDeleteInputDTO.js'
import type { PlaylistDeleteOutputDTO } from '#application/DTOs/playlist/PlaylistDeleteOutputDTO.js'
import type { StoragePort } from '#application/ports/StoragePort.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

export class DeletePlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly storageService: StoragePort,
    private readonly bucketImages: string,
  ) {}

  async execute(dto: PlaylistDeleteInputDTO): Promise<PlaylistDeleteOutputDTO> {
    const playlist = await this.playlistRepository.findById(dto.id)
    if (!playlist) throw new PlaylistNotFoundError(dto.id)

    if (playlist.coverImageKey) {
      await this.storageService.delete(this.bucketImages, playlist.coverImageKey)
    }

    await this.playlistRepository.delete(dto.id)
  }
}