import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'

export class RemoveTrackFromPlaylistUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: Input): Promise<void> {
    const playlist = await this.playlistRepo.findById(dto.playlistId)
    
    if (!playlist) {
        throw new PlaylistNotFoundError(dto.playlistId)
    }

    await this.playlistRepo.removeTrack(dto.playlistId, dto.trackId)
  }
}

type Input = {
  playlistId: string
  trackId: string
}