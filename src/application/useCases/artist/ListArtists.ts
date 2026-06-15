import type { ArtistListInputDTO } from '#application/DTOs/artist/ArtistListInputDTO.js'
import type { ArtistListOutputDTO } from '#application/DTOs/artist/ArtistListOutputDTO.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

export class ListArtistsUseCase {
  constructor(private readonly artistRepo: ArtistRepository) {}

  async execute(dto: ArtistListInputDTO): Promise<ArtistListOutputDTO> {
    const artists = await this.artistRepo.list(dto.page, dto.limit)

    return artists.map((artist) => ({
      id:     artist.id,
      userId: artist.userId,
      bio:    artist.bio,
    }))
  }
}