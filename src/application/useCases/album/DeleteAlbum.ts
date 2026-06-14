import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

export class DeleteAlbumUseCase {
  constructor(private readonly albumRepo: AlbumRepository) {}

  async execute(id: string): Promise<void> {
    await this.albumRepo.delete(id)
  }
}
