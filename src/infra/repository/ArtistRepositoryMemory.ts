import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type Artist from '#domain/artist/Artist.js'

class ArtistRepositoryMemory implements ArtistRepository {
  public artists: Artist[] = []

  public constructor(initialArtists: Artist[] = []) {
    this.artists = initialArtists
  }

  public async create(artist: Artist): Promise<Artist> {
    this.artists.push(artist)
    return artist
  }

  public async delete(id: string): Promise<void> {
    const index = this.artists.findIndex((a) => a.id === id)
    if (index !== -1) {
      this.artists.splice(index, 1)
    }
  }

  public async findById(id: string): Promise<Artist | null> {
    const artist = this.artists.find((a) => a.id === id)
    return artist ?? null
  }

  public async findByUserId(userId: string): Promise<Artist | null> {
    const artist = this.artists.find((a) => a.userId === userId)
    return artist ?? null
  }

  public async list(page: number, limit: number): Promise<Artist[]> {
    const start = (page - 1) * limit
    return this.artists.slice(start, start + limit)
  }

  public async update(id: string, data: Partial<Artist>, _expectedProfileImageKey?: string | null): Promise<void> {
    const index = this.artists.findIndex((a) => a.id === id)
    if (index === -1) return
    Object.assign(this.artists[index]!, data)
  }
}

export default ArtistRepositoryMemory
