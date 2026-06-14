import type { CreateAlbumDTO } from '#application/DTOs/album/AlbumCreateDTO.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

import Album from '#domain/album/Album.js'





export class CreateAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(dto: CreateAlbumDTO): Promise<Album> {
    const album = Album.create({
      albumType:        dto.albumType,
      artistIds:        dto.artistIds,
      isPublic:         dto.isPublic,
      label:            dto.label,
      name:             dto.name,
      releaseDate:      new Date(dto.releaseDate),
      releasePrecision: dto.releasePrecision,
      totalTracks:      dto.totalTracks,
    })
    const x = await this.albumRepo.create(album)
    return x
  }
}
