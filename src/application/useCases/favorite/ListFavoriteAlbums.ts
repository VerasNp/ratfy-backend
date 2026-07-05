import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'

type AlbumListItemOutputDTO = {
  albumType: string
  artistIds: string[]
  id: string
  label: string
  name: string
  releaseDate: string
  releasePrecision: string
  totalTracks: number
}

export class ListFavoriteAlbumsUseCase {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string }): Promise<AlbumListItemOutputDTO[]> {
    const ids = await this.favoriteRepository.findEntityIdsByUserAndType(dto.userId, 'ALBUM')
    if (ids.length === 0) return []

    const albums = await this.albumRepository.listByIds(ids)

    return albums.map((a) => ({
      albumType:        a.albumType,
      artistIds:        a.artistCredits.map((ac) => ac.artistId),
      id:               a.id,
      label:            a.label,
      name:             a.name,
      releaseDate:      a.releaseDate,
      releasePrecision: a.releasePrecision,
      totalTracks:      a.totalTracks,
    }))
  }
}
