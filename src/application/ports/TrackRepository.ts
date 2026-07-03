import type Track from '#domain/track/Track.js'

export interface TrackRepository {
  create(track: Track): Promise<void>
  delete(id: string): Promise<void>
  findByAlbumId(albumId: string): Promise<Track[]>
  findById(id: string): Promise<Track | null>
  listByIds(ids: string[]): Promise<Track[]>
  list(page: number, limit: number): Promise<Track[]>
  update(id: string, data: Partial<Track>): Promise<void>
  search(input: { page: number; limit: number; query?: string }): Promise<Track[]>
}
