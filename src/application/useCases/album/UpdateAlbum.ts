import type { AlbumUpdateInputDTO } from "#application/DTOs/album/AlbumUpdateInputDTO.js"
import type { AlbumUpdateOutputDTO } from "#application/DTOs/album/AlbumUpdateOutputDTO.js"
import type { AlbumRepository } from "#application/ports/AlbumRepository.js"

import { AlbumNotFoundError } from "#application/errors/AlbumNotFoundError.js"

export class UpdateAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

	async execute(id: string, dto: AlbumUpdateInputDTO): Promise<AlbumUpdateOutputDTO> {
	const exists = await this.albumRepo.findById(id)
	if (!exists) throw new AlbumNotFoundError(id)
    await this.albumRepo.update(id, dto)
  }
}
