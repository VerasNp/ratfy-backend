import type { ArtistDeleteInputDTO } from '#application/DTOs/artist/ArtistDeleteInputDTO.js'
import type { ArtistDeleteOutputDTO } from '#application/DTOs/artist/ArtistDeleteOutputDTO.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

export class DeleteArtistUseCase {
  constructor(
    private readonly artistRepo: ArtistRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: ArtistDeleteInputDTO): Promise<ArtistDeleteOutputDTO> {
    const exists = await this.artistRepo.findById(dto.id)
    if (!exists) throw new ArtistNotFoundError(dto.id)

    await this.artistRepo.delete(dto.id)
    await this.favoriteRepository.removeAllByEntity(dto.id, 'ARTIST')
  }
}