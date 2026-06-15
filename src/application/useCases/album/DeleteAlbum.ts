import type { AlbumDeleteInputDTO } from '#application/DTOs/album/AlbumDeleteInputDTO.js'
import type { AlbumDeleteOutputDTO } from '#application/DTOs/album/AlbumDeleteOutputDTO.js'
import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

export class DeleteAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

	async execute(dto: AlbumDeleteInputDTO): Promise<AlbumDeleteOutputDTO> {
		const exists = await this.albumRepo.findById(dto.id)
		if (!exists) throw new AlbumNotFoundError(dto.id)
    	await this.albumRepo.delete(dto.id)
  }
}
