import type { AlbumDeleteInputDTO } from '#application/DTOs/album/AlbumDeleteInputDTO.js'
import type { AlbumDeleteOutputDTO } from '#application/DTOs/album/AlbumDeleteOutputDTO.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

export class DeleteAlbumUseCase {
  constructor(
    private readonly albumRepo: AlbumRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

	async execute(dto: AlbumDeleteInputDTO): Promise<AlbumDeleteOutputDTO> {
		const exists = await this.albumRepo.findById(dto.id)
		if (!exists) throw new AlbumNotFoundError(dto.id)

		await this.albumRepo.delete(dto.id)
		await this.favoriteRepository.removeAllByEntity(dto.id, 'ALBUM')
  }
}
