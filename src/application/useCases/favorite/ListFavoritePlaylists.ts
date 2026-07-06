import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'

export class ListFavoritePlaylistsUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string }): Promise<PlaylistListItemOutputDTO[]> {
    const ids = await this.favoriteRepository.findEntityIdsByUserAndType(dto.userId, 'PLAYLIST')
    if (ids.length === 0) return []

    const playlists = await this.playlistRepository.listByIds(ids)

    return playlists.map((p) => ({
      id:       p.id,
      name:     p.name,
      isPublic: p.isPublic,
      ownerId:  p.ownerId,
    }))
  }
}

type PlaylistListItemOutputDTO = {
  id: string
  name: string
  isPublic: boolean
  ownerId: string
}
