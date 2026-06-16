import type { PlaylistListInputDTO } from '#application/DTOs/playlist/PlaylistListInputDTO.js'
import type { PlaylistListOutputDTO } from '#application/DTOs/playlist/PlaylistListOutputDTO.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

export class ListPlaylistsUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: PlaylistListInputDTO): Promise<PlaylistListOutputDTO> {
    const playlists = await this.playlistRepo.list(dto.page, dto.limit)

    return playlists.map((playlist) => ({
      id:       playlist.id,
      name:     playlist.name,
      isPublic: playlist.isPublic,
      ownerId:  playlist.ownerId,
    }))
  }
}