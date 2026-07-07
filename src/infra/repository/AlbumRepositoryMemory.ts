import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type Album from '#domain/album/Album.js'

class AlbumRepositoryMemory implements AlbumRepository {
	public albuns: Album[]

	public constructor(initialAlbuns: Album[] = []) {
		this.albuns = initialAlbuns
	}

	public listByIds(ids: string[]): Promise<Album[]> {
		const albuns = this.albuns.filter((album) => ids.includes(album.id))
		return Promise.resolve(albuns)
	}

	public create(album: Album): Promise<Album> {
		this.albuns.push(album)
		return Promise.resolve(album)
	}

	public delete(id: string): Promise<void> {
		this.albuns = this.albuns.filter((album) => album.id !== id)
		return Promise.resolve()
	}

	public findById(albumId: string): Promise<Album | null> {
		const foundAlbum = this.albuns.find((album) => album.id === albumId)
		if (!foundAlbum) {
			return Promise.resolve(null)
		}
		return Promise.resolve(foundAlbum)
	}

	public list(page: number, limit: number): Promise<Album[]> {
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		const paginatedAlbuns = this.albuns.slice(startIndex, endIndex)
		return Promise.resolve(paginatedAlbuns)
	}

	public update(
		albumId: string,
		data: Partial<Album>,
		_expectedCoverImageKey?: string | null,
	): Promise<Album | null> {
		const foundAlbum = this.albuns.find((album) => album.id === albumId)
		if (!foundAlbum) {
			return Promise.resolve(null)
		}
		foundAlbum.updateData(data)
		return Promise.resolve(foundAlbum)
	}
}

export default AlbumRepositoryMemory
