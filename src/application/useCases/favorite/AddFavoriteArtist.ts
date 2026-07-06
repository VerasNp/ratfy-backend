import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'

export class AddFavoriteArtistUseCase {
  constructor(
    private readonly artistRepository: ArtistRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string; artistId: string }): Promise<void> {
    const artist = await this.artistRepository.findById(dto.artistId)
    if (!artist) throw new ArtistNotFoundError(dto.artistId)

    await this.favoriteRepository.add(dto.userId, dto.artistId, 'ARTIST')
  }
}
