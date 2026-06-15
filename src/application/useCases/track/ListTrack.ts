import type { TrackListInputDTO }  from '#application/DTOs/track/TrackListInputDTO.js'
import type { TrackListOutputDTO } from '#application/DTOs/track/TrackListOutputDTO.js'
import type { TrackRepository }    from '#application/ports/TrackRepository.js'

export class ListTracksUseCase {
  constructor(private readonly trackRepo: TrackRepository) {}

  async execute(dto: TrackListInputDTO): Promise<TrackListOutputDTO> {
    // When albumId is provided use the dedicated query (ordered by disc + track number).
    // Otherwise fall back to the paginated general list.
    const tracks = dto.albumId
      ? await this.trackRepo.findByAlbumId(dto.albumId)
      : await this.trackRepo.list(dto.page, dto.limit)

    return tracks.map((track) => ({
      albumId:     track.albumId,
      artistIds:   track.artistIds,
      discNumber:  track.discNumber,
      durationMs:  track.durationMs,
      explicit:    track.explicit,
      id:          track.id,
      isLocal:     track.isLocal,
      name:        track.name,
      popularity:  track.popularity,
      trackNumber: track.trackNumber,
    }))
  }
}
