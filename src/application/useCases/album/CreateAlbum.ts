import type { CreateAlbumDTO } from "#application/DTOs/album/AlbumCreateDTO.js"
import type { AlbumRepository } from "#application/ports/AlbumRepository.js"

import Album from "#domain/album/Album.js"

export class CreateAlbumUseCase {
  constructor(
    private readonly albumRepo: AlbumRepository
  ) {}
  async execute(dto: CreateAlbumDTO) {
    // dto is fully typed and already validated — no extra checks needed
    const album = new Album(
      crypto.randomUUID(),
      dto.name,
      dto.albumType,
      dto.releaseDate,
      dto.totalTracks,
      dto.label,
      dto.artistIds,
      new Date(),
      false,
      true,
	)
	const x: Album = await this.albumRepo.create(album)
	return x;
  }
}
