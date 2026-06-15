import type { ArtistGetInputDTO } from '#application/DTOs/artist/ArtistGetInputDTO.js'
import type { ArtistGetOutputDTO } from '#application/DTOs/artist/ArtistGetOutputDTO.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'

export class GetArtistUseCase {
  constructor(private readonly artistRepo: ArtistRepository) {}

  async execute(dto: ArtistGetInputDTO): Promise<ArtistGetOutputDTO> {
    const artist = await this.artistRepo.findById(dto.id)
    if (!artist) throw new ArtistNotFoundError(dto.id)
    
    return {
      id:        artist.id,
      userId:    artist.userId,
      bio:       artist.bio,
      createdAt: artist.createdAt,
      updatedAt: artist.updatedAt,
    }
  }
}