import type { TrackDeleteInputDTO }  from '#application/DTOs/track/TrackDeleteInputDTO.js'
import type { TrackDeleteOutputDTO } from '#application/DTOs/track/TrackDeleteOutputDTO.js'
import type { TrackRepository }      from '#application/ports/TrackRepository.js'
import type { StoragePort }          from '#application/ports/StoragePort.js'

import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'

export class DeleteTrackUseCase {
  constructor(
    private readonly trackRepository: TrackRepository,
    private readonly storageService: StoragePort,
    private readonly bucketAudio: string,
  ) {}

  async execute(dto: TrackDeleteInputDTO): Promise<TrackDeleteOutputDTO> {
    const track = await this.trackRepository.findById(dto.id)
    if (!track) throw new TrackNotFoundError(dto.id)

    if (track.audioFileKey) {
      await this.storageService.delete(this.bucketAudio, track.audioFileKey)
    }

    await this.trackRepository.delete(dto.id)
  }
}
