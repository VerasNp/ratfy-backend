import type { UpdateAlbumDTO } from "#application/DTOs/album/AlbumUpdateDTO.js"
import type { AlbumRepository } from "#application/ports/AlbumRepository.js"

export class UpdateAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(id: string, dto: UpdateAlbumDTO): Promise<void> {
    await this.albumRepo.update(id, dto)
  }
}
