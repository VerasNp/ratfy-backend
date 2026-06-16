import type { PlaylistDeleteInputDTO } from '#application/DTOs/playlist/PlaylistDeleteInputDTO.js'
import type { PlaylistDeleteOutputDTO } from '#application/DTOs/playlist/PlaylistDeleteOutputDTO.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

export class DeletePlaylistUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: PlaylistDeleteInputDTO): Promise<PlaylistDeleteOutputDTO> {
    const exists = await this.playlistRepo.findById(dto.id)
    if (!exists) throw new PlaylistNotFoundError(dto.id)
    
    await this.playlistRepo.delete(dto.id)
  }
}