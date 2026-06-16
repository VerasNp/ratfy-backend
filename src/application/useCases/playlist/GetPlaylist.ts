import type { PlaylistGetInputDTO } from '#application/DTOs/playlist/PlaylistGetInputDTO.js'
import type { PlaylistGetOutputDTO } from '#application/DTOs/playlist/PlaylistGetOutputDTO.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'

export class GetPlaylistUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: PlaylistGetInputDTO): Promise<PlaylistGetOutputDTO> {
    const playlist = await this.playlistRepo.findById(dto.id)
    if (!playlist) throw new PlaylistNotFoundError(dto.id)
    
    return {
      id:        playlist.id,
      name:      playlist.name,
      isPublic:  playlist.isPublic,
      ownerId:   playlist.ownerId,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    }
  }
}