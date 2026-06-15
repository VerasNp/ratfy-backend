import type { TrackCreateInputDTO }  from '#application/DTOs/track/TrackCreateInputDTO.js'
import type { TrackCreateOutputDTO } from '#application/DTOs/track/TrackCreateOutputDTO.js'
import type { TrackRepository }      from '#application/ports/TrackRepository.js'

import Track from '#domain/track/Track.js'

export class CreateTrackUseCase {
  constructor(private readonly trackRepo: TrackRepository) {}

  async execute(dto: TrackCreateInputDTO): Promise<TrackCreateOutputDTO> {
    const track = Track.create({
      albumId:     dto.albumId,
      artistIds:   dto.artistIds,
      discNumber:  dto.discNumber,
      durationMs:  dto.durationMs,
      explicit:    dto.explicit,
      externalIds: dto.externalIds,
      isLocal:     dto.isLocal,
      isPublic:    dto.isPublic,
      name:        dto.name,
      popularity:  dto.popularity,
      trackNumber: dto.trackNumber,
    })

    const saved = await this.trackRepo.create(track)

    return {
      albumId:     saved.albumId,
      artistIds:   saved.artistIds,
      createdAt:   saved.createdAt,
      discNumber:  saved.discNumber,
      durationMs:  saved.durationMs,
      explicit:    saved.explicit,
      externalIds: saved.externalIds,
      id:          saved.id,
      isDeleted:   saved.isDeleted,
      isLocal:     saved.isLocal,
      isPublic:    saved.isPublic,
      name:        saved.name,
      popularity:  saved.popularity,
      trackNumber: saved.trackNumber,
      updatedAt:   saved.updatedAt,
    }
  }
}
