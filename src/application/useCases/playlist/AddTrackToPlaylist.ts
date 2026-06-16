import type { PlaylistAddTrackInputDTO } from '#application/DTOs/playlist/PlaylistAddTrackInputDTO.js'
import type { PlaylistAddTrackOutputDTO } from '#application/DTOs/playlist/PlaylistAddTrackOutputDTO.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'

export class AddTrackToPlaylistUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: PlaylistAddTrackInputDTO): Promise<PlaylistAddTrackOutputDTO> {
    const playlist = await this.playlistRepo.findById(dto.playlistId)
    if (!playlist) throw new PlaylistNotFoundError(dto.playlistId)

    await this.playlistRepo.addTrack(dto.playlistId, dto.trackId)
  }
}