import type { AlbumListInputDTO } from '#application/DTOs/album/AlbumListInputDTO.js'
import type { AlbumListOutputDTO } from '#application/DTOs/album/AlbumListOutputDTO.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

export class ListAlbumsUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(dto: AlbumListInputDTO): Promise<AlbumListOutputDTO> {
    const albums = await this.albumRepo.list(dto.page, dto.limit)

    return albums.map((album) => ({
      albumType:        album.albumType,
      artistIds:        album.artistIds,
      id:               album.id,
      label:            album.label,
      name:             album.name,
      releaseDate:      album.releaseDate,
      releasePrecision: album.releasePrecision,
      totalTracks:      album.totalTracks,
    }))
  }
}
