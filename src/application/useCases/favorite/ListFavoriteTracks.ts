import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'

type TrackListItemOutputDTO = {
  albumId: string
  artistIds: string[]
  discNumber: number
  durationMs: number
  explicit: boolean
  id: string
  title: string
  trackNumber: number
}

export class ListFavoriteTracksUseCase {
  constructor(
    private readonly trackRepository: TrackRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string }): Promise<TrackListItemOutputDTO[]> {
    const ids = await this.favoriteRepository.findEntityIdsByUserAndType(dto.userId, 'TRACK')
    if (ids.length === 0) return []

    const tracks = await this.trackRepository.listByIds(ids)

    return tracks.map((t) => ({
      albumId:     t.albumId,
      artistIds:   t.artists.map((a) => a.id),
      discNumber:  t.discNumber,
      durationMs:  t.durationMs,
      explicit:    t.explicit,
      id:          t.id,
      title:       t.title,
      trackNumber: t.trackNumber,
    }))
  }
}
