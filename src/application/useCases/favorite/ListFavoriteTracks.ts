import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import type { TrackListItemOutputDTO } from '#application/DTOs/track/TrackListOutputDTO.js'

export class ListFavoriteTracksUseCase {
  constructor(
    private readonly trackRepo: TrackRepository,
    private readonly favoriteRepo: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string }): Promise<TrackListItemOutputDTO[]> {
    const ids = await this.favoriteRepo.findEntityIdsByUserAndType(dto.userId, 'TRACK')
    if (ids.length === 0) return []

    const tracks = await this.trackRepo.listByIds(ids)

    return tracks.map((t) => ({
      albumId:     t.albumId,
      artistIds:   t.artistIds,
      discNumber:  t.discNumber,
      durationMs:  t.durationMs,
      explicit:    t.explicit,
      id:          t.id,
      isLocal:     t.isLocal,
      name:        t.name,
      popularity:  t.popularity,
      trackNumber: t.trackNumber,
    }))
  }
}
