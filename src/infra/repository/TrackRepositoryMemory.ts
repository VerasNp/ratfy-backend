import type { TrackRepository } from '#application/ports/TrackRepository.js'
import type Track from '#domain/track/Track.js'

class TrackRepositoryMemory implements TrackRepository {
  public tracks: Track[] = []

  public constructor(initialTracks: Track[] = []) {
    this.tracks = initialTracks
  }

  public async create(track: Track): Promise<Track> {
    this.tracks.push(track)
    return track
  }

  public async delete(id: string): Promise<void> {
    const index = this.tracks.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.tracks[index]!.isDeleted = true
    }
  }

  public async findByAlbumId(albumId: string): Promise<Track[]> {
    return this.tracks.filter((t) => t.albumId === albumId && !t.isDeleted)
  }

  public async findById(id: string): Promise<Track | null> {
    const track = this.tracks.find((t) => t.id === id && !t.isDeleted)
    return track ?? null
  }

  public async list(page: number, limit: number): Promise<Track[]> {
    const start = (page - 1) * limit
    return this.tracks
      .filter((t) => !t.isDeleted)
      .slice(start, start + limit)
  }

  public async update(id: string, data: Partial<Track>, _expectedAudioFileKey?: string | null): Promise<void> {
    const index = this.tracks.findIndex((t) => t.id === id)
    if (index === -1) return
    Object.assign(this.tracks[index]!, data)
  }
}

export default TrackRepositoryMemory
