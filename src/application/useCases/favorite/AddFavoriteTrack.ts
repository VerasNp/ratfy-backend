import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'

export class AddFavoriteTrackUseCase {
  constructor(
    private readonly trackRepo: TrackRepository,
    private readonly favoriteRepo: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string; trackId: string }): Promise<void> {
    const track = await this.trackRepo.findById(dto.trackId)
    if (!track) throw new TrackNotFoundError(dto.trackId)

    await this.favoriteRepo.add(dto.userId, dto.trackId, 'TRACK')
  }
}
