import type { AlbumDeleteInputDTO } from '#application/DTOs/album/AlbumDeleteInputDTO.js'
import type { AlbumDeleteOutputDTO } from '#application/DTOs/album/AlbumDeleteOutputDTO.js'
import type { StoragePort } from '#application/ports/StoragePort.js'
import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

export class DeleteAlbumUseCase {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly storageService: StoragePort,
    private readonly bucketImages: string,
  ) {}

  async execute(dto: AlbumDeleteInputDTO): Promise<AlbumDeleteOutputDTO> {
    const album = await this.albumRepository.findById(dto.id)
    if (!album) throw new AlbumNotFoundError(dto.id)

    if (album.coverImageKey) {
      await this.storageService.delete(this.bucketImages, album.coverImageKey)
    }

    await this.albumRepository.delete(dto.id)
  }
}
