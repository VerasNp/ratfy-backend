import Album from '#domain/album/Album.js'
import type { TransactionHandle } from './TransactionHandle'

export interface AlbumRepository {
	create(album: Album): Promise<Album>
	delete(albumId: string, tx?: TransactionHandle): Promise<void>
	findById(albumId: string): Promise<Album | null>
	list(page: number, limit: number): Promise<Album[]>
	listByIds(albumIds: string[]): Promise<Album[]>
	update(
		id: string,
		data: Partial<Album>,
		expectedCoverImageKey?: string | null,
	): Promise<Album | null>
}
