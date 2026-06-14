import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

import Album from '#domain/album/Album.js'

export interface ListAlbumsParams {
  limit: number   // max 50 enforced by controller/DTO
  page:  number   // 1-based
}

export class ListAlbumsUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute({ limit,page }: ListAlbumsParams): Promise<Album[]> {
    return this.albumRepo.list(page, limit)
  }
}
