import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import Album from '#domain/album/Album.js'



export class GetAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(id: string): Promise<Album> {
    const album = await this.albumRepo.findById(id)
    if (!album) throw new AlbumNotFoundError(id)
    return album
  }
}
