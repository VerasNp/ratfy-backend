
import type { TrackUpdateInputDTO }  from '#application/DTOs/track/TrackUpdateInputDTO.js'
import type { TrackUpdateOutputDTO } from '#application/DTOs/track/TrackUpdateOutputDTO.js'
import type { TrackRepository }      from '#application/ports/TrackRepository.js'

import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'

export class UpdateTrackUseCase {
  constructor(private readonly trackRepo: TrackRepository) {}

	async execute(id: string, dto: TrackUpdateInputDTO): Promise<TrackUpdateOutputDTO> {
	const exists = await this.trackRepo.findById(id)
	if (!exists) throw new TrackNotFoundError(id)
    await this.trackRepo.update(id, dto)
  }
}
