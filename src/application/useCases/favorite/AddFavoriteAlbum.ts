import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'

export class AddFavoriteAlbumUseCase {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(dto: { userId: string; albumId: string }): Promise<void> {
    const album = await this.albumRepository.findById(dto.albumId)
    if (!album) throw new AlbumNotFoundError(dto.albumId)

    await this.favoriteRepository.add(dto.userId, dto.albumId, 'ALBUM')
  }
}
