import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type Artist from '#domain/artist/Artist.js'

class ArtistRepositoryMemory implements ArtistRepository {
	public artists: Artist[]

	public constructor(initialArtists: Artist[] = []) {
		this.artists = initialArtists
	}

	public listByIds(artistIds: string[]): Promise<Artist[]> {
		const artists = this.artists.filter((artist) => artistIds.includes(artist.id))
		return Promise.resolve(artists)
	}

	public search(page: number, limit: number, query?: string): Promise<Artist[]> {
		const filteredArtists = query
			? this.artists.filter((artist) =>
					artist.user?.name?.toLowerCase().includes(query.toLowerCase()),
				)
			: this.artists
		const start = (page - 1) * limit
		const end = start + limit
		return Promise.resolve(filteredArtists.slice(start, end))
	}

	public create(artist: Artist): Promise<Artist> {
		this.artists.push(artist)
		return Promise.resolve(artist)
	}

	public delete(artistId: string): Promise<Artist | null> {
		const artist = this.artists.find((a) => a.id === artistId)
		if (!artist) {
			return Promise.resolve(null)
		}
		this.artists = this.artists.filter((a) => a.id !== artistId)
		return Promise.resolve(artist)
	}

	public findById(artistId: string): Promise<Artist | null> {
		const artist = this.artists.find((a) => a.id === artistId) || null
		return Promise.resolve(artist)
	}

	public findByUserId(userId: string): Promise<Artist | null> {
		const artist = this.artists.find((a) => a.userId === userId) || null
		return Promise.resolve(artist)
	}

	public list(page: number, limit: number): Promise<Artist[]> {
		const start = (page - 1) * limit
		const end = start + limit
		return Promise.resolve(this.artists.slice(start, end))
	}

	public update(artistId: string, data: Partial<Artist>): Promise<Artist | null> {
		const artistIndex = this.artists.findIndex((a) => a.id === artistId)
		if (artistIndex === -1) {
			return Promise.resolve(null)
		}
		this.artists[artistIndex]!.updateData(data)
		return Promise.resolve(this.artists[artistIndex]!)
	}
}

export default ArtistRepositoryMemory
