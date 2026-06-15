import type { ArtistUpdateInputDTO } from "#application/DTOs/artist/ArtistUpdateInputDTO.js"
import type { ArtistUpdateOutputDTO } from "#application/DTOs/artist/ArtistUpdateOutputDTO.js"
import type { ArtistRepository } from "#application/ports/ArtistRepository.js"
import type Artist from "#domain/artist/Artist.js"

import { ArtistNotFoundError } from "#application/errors/ArtistNotFoundError.js"

export class UpdateArtistUseCase {
  constructor(private readonly artistRepo: ArtistRepository) {}

  async execute(id: string, dto: ArtistUpdateInputDTO): Promise<ArtistUpdateOutputDTO> {
    const exists = await this.artistRepo.findById(id)
    if (!exists) throw new ArtistNotFoundError(id)

    const dataToUpdate: Partial<Artist> = {}
    if (dto.bio !== undefined) {
      dataToUpdate.bio = dto.bio
    }
        
    await this.artistRepo.update(id, dataToUpdate)
  }
}