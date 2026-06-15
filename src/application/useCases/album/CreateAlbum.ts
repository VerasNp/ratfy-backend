import type { AlbumCreateInputDTO } from '#application/DTOs/album/AlbumCreateInputDTO.js'
import type { AlbumCreateOutputDTO } from '#application/DTOs/album/AlbumCreateOutputDTO.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

import Album from '#domain/album/Album.js'

export class CreateAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(dto: AlbumCreateInputDTO): Promise<AlbumCreateOutputDTO> {
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
    const albumPromise = await this.albumRepo.create(album)
    return {
      albumType:        albumPromise.albumType,
      artistIds:        albumPromise.artistIds,
      createdAt:        albumPromise.createdAt,
      id:               albumPromise.id,
      isDeleted:        albumPromise.isDeleted ?? false,
      isPublic:         albumPromise.isPublic,
      label:            albumPromise.label,
      name:             albumPromise.name,
      releaseDate:      albumPromise.releaseDate,
      releasePrecision: albumPromise.releasePrecision,
      totalTracks:      albumPromise.totalTracks,
      updatedAt:        albumPromise.updatedAt,
    }

  }
}
