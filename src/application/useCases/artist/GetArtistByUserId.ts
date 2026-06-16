import type { ArtistGetByUserIdInputDTO } from '#application/DTOs/artist/ArtistGetByUserIdInputDTO.js'
import type { ArtistGetByUserIdOutputDTO } from '#application/DTOs/artist/ArtistGetByUserIdOutputDTO.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'

export class GetArtistByUserIdUseCase {
  constructor(private readonly artistRepo: ArtistRepository) {}

  async execute(dto: ArtistGetByUserIdInputDTO): Promise<ArtistGetByUserIdOutputDTO> {
    const artist = await this.artistRepo.findByUserId(dto.userId)
    
    if (!artist) throw new ArtistNotFoundError(dto.userId)

    return {
      id:        artist.id,
      userId:    artist.userId,
      bio:       artist.bio,
      createdAt: artist.createdAt,
      updatedAt: artist.updatedAt,
    }
  }
}