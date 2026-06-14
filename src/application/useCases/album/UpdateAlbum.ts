import type { UpdateAlbumDTO } from "#application/DTOs/album/AlbumUpdateDTO.js"
import type { AlbumRepository } from "#application/ports/AlbumRepository.js"

import Album from "#domain/album/Album.js"

export class UpdateAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(id: string, dto: UpdateAlbumDTO): Promise<number> {
    const result = await this.albumRepo.update(id, dto)
    return result
  }
}
