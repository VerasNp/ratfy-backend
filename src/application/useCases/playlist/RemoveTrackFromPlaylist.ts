import type { PlaylistRemoveTrackInputDTO } from '#application/DTOs/playlist/PlaylistRemoveTrackInputDTO.js'
import type { PlaylistRemoveTrackOutputDTO } from '#application/DTOs/playlist/PlaylistRemoveTrackOutputDTO.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'

export class RemoveTrackFromPlaylistUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: PlaylistRemoveTrackInputDTO): Promise<PlaylistRemoveTrackOutputDTO> {
    const playlist = await this.playlistRepo.findById(dto.playlistId)
    
    if (!playlist) {
        throw new PlaylistNotFoundError(dto.playlistId)
    }

    await this.playlistRepo.removeTrack(dto.playlistId, dto.trackId)
  }
}