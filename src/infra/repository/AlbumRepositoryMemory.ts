import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type Album from '#domain/album/Album.js'

class AlbumRepositoryMemory implements AlbumRepository {
  public albums: Album[] = []

  public constructor(initialAlbums: Album[] = []) {
    this.albums = initialAlbums
  }

  public async create(album: Album): Promise<Album> {
    this.albums.push(album)
    return album
  }

  public async delete(id: string): Promise<void> {
    const index = this.albums.findIndex((a) => a.id === id)
    if (index !== -1) {
      this.albums[index]!.isDeleted = true
    }
  }

  public async findById(id: string): Promise<Album | null> {
    const album = this.albums.find((a) => a.id === id && !a.isDeleted)
    return album ?? null
  }

  public async list(page: number, limit: number): Promise<Album[]> {
    const start = (page - 1) * limit
    return this.albums
      .filter((a) => !a.isDeleted)
      .slice(start, start + limit)
  }

  public async update(id: string, data: Partial<Album>, _expectedCoverImageKey?: string | null): Promise<void> {
    const index = this.albums.findIndex((a) => a.id === id)
    if (index === -1) return
    Object.assign(this.albums[index]!, data)
  }
}

export default AlbumRepositoryMemory
