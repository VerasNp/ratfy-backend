import type { AlbumGetInputDTO } from '#application/DTOs/album/AlbumGetInputDTO.js'
import type { AlbumGetOutputDTO } from '#application/DTOs/album/AlbumGetOutputDTO.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import Album from '#domain/album/Album.js'



export class GetAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(dto: AlbumGetInputDTO): Promise<AlbumGetOutputDTO> {
    const album = await this.albumRepo.findById(dto.id)
    if (!album) throw new AlbumNotFoundError(dto.id)
    return {
      albumType:        album.albumType,
      artistIds:        album.artistIds,
      createdAt:        album.createdAt,
      id:               album.id,
      isDeleted:        album.isDeleted ?? false,
      isPublic:         album.isPublic,
      label:            album.label,
      name:             album.name,
      releaseDate:      album.releaseDate,
      releasePrecision: album.releasePrecision,
      totalTracks:      album.totalTracks,
      updatedAt:        album.updatedAt,
    }

  }
}
