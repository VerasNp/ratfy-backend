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
	private _album: Album | null
	private _artists: Artist[]
	private _createdAt: Date
	private _updatedAt: Date
	private _deletedAt: Date | null

	private constructor(params: {
		id: string
		title: string
		durationMs: DurationMs
		discNumber: DiscNumber
		trackNumber: TrackNumber
		explicit: boolean
		lyrics: string | null
		isPublic: boolean
		album: Album | null
		artists: Artist[]
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
	}) {
		this.id = params.id
		this._title = params.title
		this._durationMs = params.durationMs
		this._discNumber = params.discNumber
		this._trackNumber = params.trackNumber
		this._explicit = params.explicit
		this._lyrics = params.lyrics
		this._isPublic = params.isPublic
		this._album = params.album
		this._artists = params.artists
		this._createdAt = params.createdAt
		this._updatedAt = params.updatedAt
		this._deletedAt = params.deletedAt
	}

	public static create(params: {
		title: string
		durationMs: number
		discNumber: number
		trackNumber: number
		explicit: boolean
		lyrics?: string | null
		isPublic: boolean
		album?: Album | null
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
			album: params.album ?? null,
			artists: params.artists ?? [],
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
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
		album?: Album | null
		artists?: Artist[]
		createdAt: Date
		updatedAt: Date
		deletedAt: Date | null
	}): Track {
		return new Track({
			...params,
			durationMs: new DurationMs(params.durationMs),
			discNumber: new DiscNumber(params.discNumber),
			trackNumber: new TrackNumber(params.trackNumber),
			album: params.album ?? null,
			artists: params.artists ?? [],
		})
	}

	public updateData(data: {
		title?: string
		explicit?: boolean
		lyrics?: string | null
		isPublic?: boolean
	}): void {
		if (data.title !== undefined) this._title = data.title
		if (data.explicit !== undefined) this._explicit = data.explicit
		if (data.lyrics !== undefined) this._lyrics = data.lyrics
		if (data.isPublic !== undefined) this._isPublic = data.isPublic
		this._updatedAt = new Date()
	}

	public get title() {
		return this._title
	}
	public get durationMs() {
		return this._durationMs
	}
	public get discNumber() {
		return this._discNumber
	}
	public get trackNumber() {
		return this._trackNumber
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
}

export default Track
