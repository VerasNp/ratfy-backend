import type { TrackRepository } from '#application/ports/TrackRepository.js'
import type Track from '#domain/track/Track.js'

class TrackRepositoryMemory implements TrackRepository {
	public tracks: Track[]

	public constructor(initialTracks: Track[] = []) {
		this.tracks = initialTracks
	}

	public listByIds(ids: string[]): Promise<Track[]> {
		const foundTracks = this.tracks.filter((track) => ids.includes(track.id))
		return Promise.resolve(foundTracks)
	}

	public create(track: Track): Promise<void> {
		this.tracks.push(track)
		return Promise.resolve()
	}

	public delete(id: string): Promise<void> {
		this.tracks = this.tracks.filter((track) => track.id !== id)
		return Promise.resolve()
	}

	public findByAlbumId(albumId: string): Promise<Track[]> {
		const tracks = this.tracks.filter((track) => track.id === albumId)
		return Promise.resolve(tracks)
	}

	public findById(id: string): Promise<Track | null> {
		const track = this.tracks.find((track) => track.id === id)
		return Promise.resolve(track || null)
	}

	public list(page: number, limit: number): Promise<Track[]> {
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		return Promise.resolve(this.tracks.slice(startIndex, endIndex))
	}

	public update(id: string, data: Partial<Track>): Promise<void> {
		const index = this.tracks.findIndex((track) => track.id === id)
		if (index !== -1) {
			this.tracks[index]?.updateData(data)
		}
		return Promise.resolve()
	}

	public search(input: { page: number; limit: number, query?: string }): Promise<Track[]> {
		const { page, limit, query } = input
		const startIndex = (page - 1) * limit
		const endIndex = startIndex + limit
		let tracks = this.tracks.slice(startIndex, endIndex)
		if (query) {
			tracks = tracks.filter((track) => track.title.includes(query))
		}
		return Promise.resolve(tracks)
	}
}

export default TrackRepositoryMemory
