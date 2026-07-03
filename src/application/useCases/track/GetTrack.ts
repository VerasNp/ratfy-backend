import type { TrackGetInputDTO }  from '#infra/http/schemas/TracksSchemas.js'
import type { TrackGetOutputDTO } from '#application/DTOs/track/TrackGetOutputDTO.js'
import type { TrackRepository }   from '#application/ports/TrackRepository.js'

import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'

export class GetTrackUseCase {
  constructor(private readonly trackRepo: TrackRepository) {}

  async execute(dto: TrackGetInputDTO): Promise<TrackGetOutputDTO> {
    const track = await this.trackRepo.findById(dto.id)
    if (!track) throw new TrackNotFoundError(dto.id)
    return {
      albumId:     track.albumId,
      artistIds:   track.artistIds,
      createdAt:   track.createdAt,
      discNumber:  track.discNumber,
      durationMs:  track.durationMs,
      explicit:    track.explicit,
      externalIds: track.externalIds,
      id:          track.id,
      isDeleted:   track.isDeleted,
      isLocal:     track.isLocal,
      isPublic:    track.isPublic,
      name:        track.name,
      popularity:  track.popularity,
      trackNumber: track.trackNumber,
      updatedAt:   track.updatedAt,
    }
  }
}
