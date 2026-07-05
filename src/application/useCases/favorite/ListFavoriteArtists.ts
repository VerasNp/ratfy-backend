import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

export class ListFavoriteArtistsUseCase {
  constructor(
    private readonly artistRepository: ArtistRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string }): Promise<ArtistListItemOutputDTO[]> {
    const ids = await this.favoriteRepository.findEntityIdsByUserAndType(dto.userId, 'ARTIST')
    if (ids.length === 0) return []

    const artists = await this.artistRepository.listByIds(ids)

    return artists.map((a) => ({
      id:     a.id,
      userId: a.userId,
      bio:    a.bio,
    }))
  }
}

type ArtistListItemOutputDTO = {
  id: string
  userId: string
  bio: string | null
}
