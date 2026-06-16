import type { PlaylistUpdateInputDTO } from "#application/DTOs/playlist/PlaylistUpdateInputDTO.js"
import type { PlaylistUpdateOutputDTO } from "#application/DTOs/playlist/PlaylistUpdateOutputDTO.js"
import type { PlaylistRepository } from "#application/ports/PlaylistRepository.js"
import type Playlist from "#domain/playlist/Playlist.js"

import { PlaylistNotFoundError } from "#application/errors/PlaylistNotFoundError.js"

export class UpdatePlaylistUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(id: string, dto: PlaylistUpdateInputDTO): Promise<PlaylistUpdateOutputDTO> {
    const exists = await this.playlistRepo.findById(id)
    if (!exists) throw new PlaylistNotFoundError(id)

    const dataToUpdate: Partial<Playlist> = {}
    
    if (dto.name !== undefined) {
      dataToUpdate.name = dto.name
    }
    
    if (dto.isPublic !== undefined) {
      dataToUpdate.isPublic = dto.isPublic
    }
        
    await this.playlistRepo.update(id, dataToUpdate)
  }
}