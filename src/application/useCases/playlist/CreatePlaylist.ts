import type { PlaylistCreateInputDTO } from '#application/DTOs/playlist/PlaylistCreateInputDTO.js'
import type { PlaylistCreateOutputDTO } from '#application/DTOs/playlist/PlaylistCreateOutputDTO.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

import Playlist from '#domain/playlist/Playlist.js'

export class CreatePlaylistUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: PlaylistCreateInputDTO): Promise<PlaylistCreateOutputDTO> {
    const playlist = Playlist.create({
      name:     dto.name,
      ownerId:  dto.ownerId,
      isPublic: dto.isPublic,
    })
    
    const savedPlaylist = await this.playlistRepo.create(playlist)
    
    return {
      id:        savedPlaylist.id,
      name:      savedPlaylist.name,
      isPublic:  savedPlaylist.isPublic,
      ownerId:   savedPlaylist.ownerId,
      createdAt: savedPlaylist.createdAt,
      updatedAt: savedPlaylist.updatedAt,
    }
  }
}