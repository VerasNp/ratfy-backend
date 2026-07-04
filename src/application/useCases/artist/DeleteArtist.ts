import type { ArtistDeleteInputDTO } from '#application/DTOs/artist/ArtistDeleteInputDTO.js'
import type { ArtistDeleteOutputDTO } from '#application/DTOs/artist/ArtistDeleteOutputDTO.js'
import type { StoragePort } from '#application/ports/StoragePort.js'
import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

export class DeleteArtistUseCase {
  constructor(
    private readonly artistRepository: ArtistRepository,
    private readonly storageService: StoragePort,
    private readonly bucketImages: string,
  ) {}

  async execute(dto: ArtistDeleteInputDTO): Promise<ArtistDeleteOutputDTO> {
    const artist = await this.artistRepository.findById(dto.id)
    if (!artist) throw new ArtistNotFoundError(dto.id)

    if (artist.profileImageKey) {
      await this.storageService.delete(this.bucketImages, artist.profileImageKey)
    }

    await this.artistRepository.delete(dto.id)
  }
}