import type Track from '#domain/track/Track.js'
import type { TransactionHandle } from './TransactionHandle'

export interface TrackRepository {
  create(trackData: Track): Promise<Track>
  delete(trackId: string, tx?: TransactionHandle): Promise<void>
  findByAlbumId(albumId: string): Promise<Track[]>
  findById(trackId: string): Promise<Track | null>
  listByIds(trackIds: string[]): Promise<Track[]>
  list(page: number, limit: number): Promise<Track[]>
  update(trackId: string, trackData: Partial<Track>): Promise<Track | null>
  search(input: { page: number; limit: number; query?: string }): Promise<Track[]>
}
