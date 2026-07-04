import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import type Playlist from '#domain/playlist/Playlist.js'

class PlaylistRepositoryMemory implements PlaylistRepository {
  public playlists: Playlist[] = []

  public constructor(initialPlaylists: Playlist[] = []) {
    this.playlists = initialPlaylists
  }

  public async create(playlist: Playlist): Promise<Playlist> {
    this.playlists.push(playlist)
    return playlist
  }

  public async delete(id: string): Promise<void> {
    const index = this.playlists.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.playlists.splice(index, 1)
    }
  }

  public async findById(id: string): Promise<Playlist | null> {
    const playlist = this.playlists.find((p) => p.id === id)
    return playlist ?? null
  }

  public async listByOwnerId(ownerId: string, page: number, limit: number): Promise<Playlist[]> {
    const start = (page - 1) * limit
    return this.playlists
      .filter((p) => p.ownerId === ownerId)
      .slice(start, start + limit)
  }

  public async list(page: number, limit: number): Promise<Playlist[]> {
    const start = (page - 1) * limit
    return this.playlists.slice(start, start + limit)
  }

  public async update(id: string, data: Partial<Playlist>, _expectedCoverImageKey?: string | null): Promise<void> {
    const index = this.playlists.findIndex((p) => p.id === id)
    if (index === -1) return
    Object.assign(this.playlists[index]!, data)
  }

  public async addTrack(playlistId: string, trackId: string): Promise<void> {
    // no-op for memory implementation
  }

  public async removeTrack(playlistId: string, trackId: string): Promise<void> {
    // no-op for memory implementation
  }
}

export default PlaylistRepositoryMemory
