import type { ArtistCreateInputDTO } from '#application/DTOs/artist/ArtistCreateInputDTO.js'
import type { ArtistCreateOutputDTO } from '#application/DTOs/artist/ArtistCreateOutputDTO.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

import Artist from '#domain/artist/Artist.js'

export class CreateArtistUseCase {
  constructor(private readonly artistRepo: ArtistRepository) {}

  async execute(dto: ArtistCreateInputDTO): Promise<ArtistCreateOutputDTO> {
    const artist = Artist.create({
      userId: dto.userId,
      bio:    dto.bio,
    })
    
    const savedArtist = await this.artistRepo.create(artist)
    
    return {
      id:        savedArtist.id,
      userId:    savedArtist.userId,
      bio:       savedArtist.bio,
      createdAt: savedArtist.createdAt,
      updatedAt: savedArtist.updatedAt,
    }
  }
}