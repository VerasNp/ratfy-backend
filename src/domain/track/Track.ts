import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import DurationMs from '#domain/track/DurationMs.js'
import DiscNumber from './DiscNumber.js'
import TrackNumber from './TrackNumber.js'
import crypto from 'crypto'

class Track {
	public readonly id: string
	private _title: string
	private _durationMs: DurationMs
	private _discNumber: DiscNumber
	private _trackNumber: TrackNumber
	private _explicit: boolean
	private _lyrics: string | null
	private _isPublic: boolean
	private _albumId: string
	private _album: Album | null
	private _artists: Artist[]
	private _createdAt: Date
	private _updatedAt: Date
	private _deletedAt: Date | null
	private _audioFileKey: string | null
	private _audioFileSize: number | null
	private _audioContentType: string | null
	private _drmEnabled: boolean

	private constructor(params: {
		id: string
		title: string
		durationMs: DurationMs
		discNumber: DiscNumber
		trackNumber: TrackNumber
		explicit: boolean
		lyrics: string | null
		isPublic: boolean
		albumId: string
		album: Album | null
		artists: Artist[]
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
		audioFileKey: string | null
		audioFileSize: number | null
		audioContentType: string | null
		drmEnabled: boolean
	}) {
		this.id = params.id
		this._title = params.title
		this._durationMs = params.durationMs
		this._discNumber = params.discNumber
		this._trackNumber = params.trackNumber
		this._explicit = params.explicit
		this._lyrics = params.lyrics
		this._isPublic = params.isPublic
		this._albumId = params.albumId
		this._album = params.album
		this._artists = params.artists
		this._createdAt = params.createdAt
		this._updatedAt = params.updatedAt
		this._deletedAt = params.deletedAt
		this._audioFileKey = params.audioFileKey
		this._audioFileSize = params.audioFileSize
		this._audioContentType = params.audioContentType
		this._drmEnabled = params.drmEnabled
	}

	public static create(params: {
		title: string
		durationMs: number
		discNumber: number
		trackNumber: number
		explicit: boolean
		lyrics?: string | null
		isPublic: boolean
		album: Album
		artists?: Artist[]
	}): Track {
		return new Track({
			id: crypto.randomUUID(),
			title: params.title,
			durationMs: new DurationMs(params.durationMs),
			discNumber: new DiscNumber(params.discNumber),
			trackNumber: new TrackNumber(params.trackNumber),
			explicit: params.explicit,
			lyrics: params.lyrics ?? null,
			isPublic: params.isPublic,
			albumId: params.album.id,
			album: params.album,
			artists: params.artists ?? [],
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
			audioFileKey: null,
			audioFileSize: null,
			audioContentType: null,
			drmEnabled: false,
		})
	}

	public static restore(params: {
		id: string
		title: string
		durationMs: number
		discNumber: number
		trackNumber: number
		explicit: boolean
		lyrics: string | null
		isPublic: boolean
		albumId: string
		album?: Album | null
		artists?: Artist[]
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
		audioFileKey: string | null
		audioFileSize: number | null
		audioContentType: string | null
		drmEnabled: boolean
	}): Track {
		return new Track({
			id: params.id,
			title: params.title,
			durationMs: new DurationMs(params.durationMs),
			discNumber: new DiscNumber(params.discNumber),
			trackNumber: new TrackNumber(params.trackNumber),
			explicit: params.explicit,
			lyrics: params.lyrics,
			isPublic: params.isPublic,
			albumId: params.albumId,
			album: params.album ?? null,
			artists: params.artists ?? [],
			createdAt: params.createdAt,
			updatedAt: params.updatedAt,
			deletedAt: params.deletedAt,
			audioFileKey: params.audioFileKey,
			audioFileSize: params.audioFileSize,
			audioContentType: params.audioContentType,
			drmEnabled: params.drmEnabled,
		})
	}

	public updateData(data: {
		title?: string
		durationMs?: number
		discNumber?: number
		trackNumber?: number
		explicit?: boolean
		lyrics?: string | null
		isPublic?: boolean
		album?: Album
		artists?: Artist[]
		audioFileKey: string | null
		audioFileSize: number | null
		audioContentType: string | null
		drmEnabled: boolean
	}): void {
		if (data.title !== undefined) this._title = data.title
		if (data.durationMs !== undefined) this._durationMs = new DurationMs(data.durationMs)
		if (data.discNumber !== undefined) this._discNumber = new DiscNumber(data.discNumber)
		if (data.trackNumber !== undefined) this._trackNumber = new TrackNumber(data.trackNumber)
		if (data.explicit !== undefined) this._explicit = data.explicit
		if (data.lyrics !== undefined) this._lyrics = data.lyrics
		if (data.isPublic !== undefined) this._isPublic = data.isPublic
		if (data.album !== undefined) this._album = data.album
		if (data.artists !== undefined) this._artists = data.artists
		if (data.audioFileKey !== undefined) this._audioFileKey = data.audioFileKey
		if (data.audioFileSize !== undefined) this._audioFileSize = data.audioFileSize
		if (data.audioContentType !== undefined) this._audioContentType = data.audioContentType
		if (data.drmEnabled !== undefined) this._drmEnabled = data.drmEnabled
		this._updatedAt = new Date()
	}

	public get title() {
		return this._title
	}
	public get durationMs() {
		return this._durationMs.value
	}
	public get discNumber() {
		return this._discNumber.value
	}
	public get trackNumber() {
		return this._trackNumber.value
	}
	public get explicit() {
		return this._explicit
	}
	public get lyrics() {
		return this._lyrics
	}
	public get isPublic() {
		return this._isPublic
	}
	public get albumId() {
		return this._albumId
	}
	public get album() {
		return this._album
	}
	public get artists() {
		return this._artists
	}
	public get createdAt() {
		return this._createdAt
	}
	public get updatedAt() {
		return this._updatedAt
	}
	public get deletedAt() {
		return this._deletedAt
	}
	public get audioFileKey(): string | null {
		return this._audioFileKey
	}
	public get audioFileSize(): number | null {
		return this._audioFileSize
	}
	public get audioContentType(): string | null {
		return this._audioContentType
	}
	public get drmEnabled(): boolean {
		return this._drmEnabled
	}
}

export default Track
