import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type Album from '#domain/album/Album.js'

class AlbumRepositoryMemory implements AlbumRepository {
	public albuns: Album[]

	public constructor(initialAlbuns: Album[]) {
		this.albuns = initialAlbuns
	}

	public create(album: Album): Promise<Album> {
		throw new Error('Method not implemented.')
	}

	public delete(id: string): Promise<void> {
		throw new Error('Method not implemented.')
	}

	public findById(id: string): Promise<Album | null> {
		throw new Error('Method not implemented.')
	}

	public list(page: number, limit: number): Promise<Album[]> {
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		const paginatedAlbuns = this.albuns.slice(startIndex, endIndex)
		return Promise.resolve(paginatedAlbuns)
	}

	public update(id: string, data: Partial<Album>): Promise<void> {
		throw new Error('Method not implemented.')
	}
}

export default AlbumRepositoryMemory
