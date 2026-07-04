import crypto from 'crypto'
import ReleaseDate from './ReleaseDate'
import ArtistCredit from './ArtistCredit'
import AlbumType from './AlbumType'
import TotalTracks from './TotalTracks'
import type Artist from '#domain/artist/Artist.js'

class Album {
	public readonly id: string
	private _name: string
	private _albumType: AlbumType
	private _releaseDate: ReleaseDate
	private _totalTracks: TotalTracks
	private _label: string
	private _isPublic: boolean
	private _artistCredits: ArtistCredit[]
	private _updatedAt: Date
	private _createdAt: Date
	private _deletedAt: Date | null

	private constructor(params: {
		id: string
		name: string
		albumType: AlbumType
		releaseDate: ReleaseDate
		totalTracks: TotalTracks
		label: string
		isPublic: boolean
		artistCredits: ArtistCredit[]
		updatedAt: Date
		createdAt: Date
		deletedAt: Date | null
	}) {
		this.id = params.id
		this._name = params.name
		this._albumType = params.albumType
		this._releaseDate = params.releaseDate
		this._totalTracks = params.totalTracks
		this._label = params.label
		this._isPublic = params.isPublic
		this._artistCredits = params.artistCredits
		this._updatedAt = params.updatedAt
		this._createdAt = params.createdAt
		this._deletedAt = params.deletedAt
	}

	public static create(params: {
		name: string
		albumType: string
		releaseDate: string
		releasePrecision: string
		totalTracks: number
		label: string
		isPublic: boolean
		artists: Artist[]
	}): Album {
		const id = crypto.randomUUID()
		const releaseDate = new ReleaseDate(params.releaseDate, params.releasePrecision)
		const albumType = new AlbumType(params.albumType)
		const totalTracks = new TotalTracks(params.totalTracks, albumType)
		const artistCredits = params.artists.map((artist) => {
			return ArtistCredit.create(artist.id, artist)
		})
		return new Album({
			id,
			name: params.name,
			albumType: albumType,
			releaseDate,
			totalTracks: totalTracks,
			label: params.label,
			isPublic: params.isPublic,
			artistCredits: artistCredits,
			updatedAt: new Date(),
			createdAt: new Date(),
			deletedAt: null,
		})
	}

	public static restore(params: {
		id: string
		name: string
		albumType: string
		releaseDate: string
		releasePrecision: string
		totalTracks: number
		label: string
		isPublic: boolean
		artistCredits: ArtistCredit[]
		updatedAt: Date
		createdAt: Date
		deletedAt: Date | null
	}): Album {
		const releaseDate = new ReleaseDate(params.releaseDate, params.releasePrecision)
		const albumType = new AlbumType(params.albumType)
		const totalTracks = new TotalTracks(params.totalTracks, albumType)
		return new Album({
			id: params.id,
			name: params.name,
			albumType: albumType,
			releaseDate,
			totalTracks: totalTracks,
			label: params.label,
			isPublic: params.isPublic,
			artistCredits: params.artistCredits,
			updatedAt: params.updatedAt,
			createdAt: params.createdAt,
			deletedAt: params.deletedAt,
		})
	}

	public get name(): string {
		return this._name
	}

	public get albumType(): string {
		return this._albumType.value
	}

	public get releaseDate(): string {
		return this._releaseDate.value
	}

	public get releasePrecision(): string {
		return this._releaseDate.precision
	}

	public get totalTracks(): number {
		return this._totalTracks.value
	}

	public get label(): string {
		return this._label
	}

	public get isPublic(): boolean {
		return this._isPublic
	}

	public get artistCredits(): ArtistCredit[] {
		return this._artistCredits
	}

	public get updatedAt(): Date {
		return this._updatedAt
	}

	public get createdAt(): Date {
		return this._createdAt
	}

	public get deletedAt(): Date | null {
		return this._deletedAt
	}
}

export default Album
