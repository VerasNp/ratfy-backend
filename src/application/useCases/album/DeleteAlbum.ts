import type { AlbumDeleteInputDTO } from '#application/DTOs/album/AlbumDeleteInputDTO.js'
import type { AlbumDeleteOutputDTO } from '#application/DTOs/album/AlbumDeleteOutputDTO.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

export class DeleteAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(dto: AlbumDeleteInputDTO): Promise<AlbumDeleteOutputDTO> {
    await this.albumRepo.delete(dto.id)
  }
}
