import type { PlaylistListByOwnerIdInputDTO } from '#application/DTOs/playlist/PlaylistListByOwnerIdInputDTO.js'
import type { PlaylistListByOwnerIdOutputDTO } from '#application/DTOs/playlist/PlaylistListByOwnerIdOutputDTO.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

export class ListPlaylistsByOwnerIdUseCase {
  constructor(private readonly playlistRepo: PlaylistRepository) {}

  async execute(dto: PlaylistListByOwnerIdInputDTO): Promise<PlaylistListByOwnerIdOutputDTO> {
    const playlists = await this.playlistRepo.listByOwnerId(dto.ownerId, dto.page, dto.limit)

    return playlists.map((playlist) => ({
      id:       playlist.id,
      name:     playlist.name,
      isPublic: playlist.isPublic,
      ownerId:  playlist.ownerId,
    }))
  }
}