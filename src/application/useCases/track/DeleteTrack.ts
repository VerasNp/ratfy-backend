import type { TrackDeleteInputDTO }  from '#application/DTOs/track/TrackDeleteInputDTO.js'
import type { TrackDeleteOutputDTO } from '#application/DTOs/track/TrackDeleteOutputDTO.js'
import type { TrackRepository }      from '#application/ports/TrackRepository.js'
import type { FavoriteRepository }   from '#application/ports/FavoriteRepository.js'

import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'

export class DeleteTrackUseCase {
  constructor(
    private readonly trackRepository: TrackRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: TrackDeleteInputDTO): Promise<TrackDeleteOutputDTO> {
    const exists = await this.trackRepository.findById(dto.id)
    if (!exists) throw new TrackNotFoundError(dto.id)
    await this.trackRepository.delete(dto.id)
    await this.favoriteRepository.removeAllByEntity(dto.id, 'TRACK')
  }
}
