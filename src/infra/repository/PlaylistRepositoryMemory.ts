import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import type Playlist from '#domain/playlist/Playlist.js'

class PlaylistRepositoryMemory implements PlaylistRepository {
	public playlists: Playlist[]
	public tracks = new Map<string, Set<string>>()

	public constructor(initialPlaylists: Playlist[] = []) {
		this.playlists = initialPlaylists
	}

	public create(playlist: Playlist): Promise<Playlist> {
		this.playlists.push(playlist)
		return Promise.resolve(playlist)
	}

	public delete(id: string): Promise<void> {
		this.playlists = this.playlists.filter((p) => p.id !== id)
		return Promise.resolve()
	}

	public findById(id: string): Promise<Playlist | null> {
		const found = this.playlists.find((p) => p.id === id)
		return Promise.resolve(found ?? null)
	}

	public listByIds(ids: string[]): Promise<Playlist[]> {
		const found = this.playlists.filter((p) => ids.includes(p.id))
		return Promise.resolve(found)
	}

	public listByOwnerId(ownerId: string, page: number, limit: number): Promise<Playlist[]> {
		const owned = this.playlists.filter((p) => p.ownerId === ownerId)
		const start = (page - 1) * limit
		const end = start + limit
		return Promise.resolve(owned.slice(start, end))
	}

	public list(page: number, limit: number): Promise<Playlist[]> {
		const start = (page - 1) * limit
		const end = start + limit
		return Promise.resolve(this.playlists.slice(start, end))
	}

	public update(
		id: string,
		data: Partial<Playlist>,
		_expectedCoverImageKey?: string | null,
	): Promise<void> {
		const playlist = this.playlists.find((p) => p.id === id)
		if (!playlist) return Promise.resolve()
		if (data.name !== undefined) playlist.name = data.name
		if (data.isPublic !== undefined) playlist.isPublic = data.isPublic
		if (data.coverImageKey !== undefined) playlist.coverImageKey = data.coverImageKey
		if (data.coverImageSize !== undefined) playlist.coverImageSize = data.coverImageSize
		playlist.updatedAt = new Date()
		return Promise.resolve()
	}

	public addTrack(playlistId: string, trackId: string): Promise<void> {
		if (!this.tracks.has(playlistId)) {
			this.tracks.set(playlistId, new Set())
		}
		this.tracks.get(playlistId)!.add(trackId)
		return Promise.resolve()
	}

	public removeTrack(playlistId: string, trackId: string): Promise<void> {
		this.tracks.get(playlistId)?.delete(trackId)
		return Promise.resolve()
	}
}

export default PlaylistRepositoryMemory
