import type { TrackDeleteInputDTO }  from '#application/DTOs/track/TrackDeleteInputDTO.js'
import type { TrackDeleteOutputDTO } from '#application/DTOs/track/TrackDeleteOutputDTO.js'
import type { TrackRepository }      from '#application/ports/TrackRepository.js'

import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'

export class DeleteTrackUseCase {
  constructor(private readonly trackRepo: TrackRepository) {}

	async execute(dto: TrackDeleteInputDTO): Promise<TrackDeleteOutputDTO> {
	const exists = await this.trackRepo.findById(dto.id)
	if (!exists) throw new TrackNotFoundError(dto.id)
    await this.trackRepo.delete(dto.id)
  }
}
