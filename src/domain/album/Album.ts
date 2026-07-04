import crypto from 'crypto'

export type AlbumType = 'album' | 'single'
export type ReleasePrecision = 'day' | 'month' | 'year'

const RELEASE_PATTERNS: Record<ReleasePrecision, RegExp> = {
	day: /^\d{4}-\d{2}-\d{2}$/,
	month: /^\d{4}-\d{2}$/,
	year: /^\d{4}$/,
}

class Album {
	public readonly id: string
	public readonly albumType: AlbumType
	public readonly artistIds: string[]
	public readonly createdAt: Date
	public isDeleted?: boolean
	public readonly label: string
	public readonly name: string
	public readonly releaseDate: string
	public readonly releasePrecision: ReleasePrecision
	public totalTracks: number
	public updatedAt: Date
  private constructor(params: {
    albumType:        AlbumType
    artistIds:        string[]
    createdAt:        Date
    id:               string
    isDeleted?:		  boolean
    label:            string
    name:             string
    releaseDate:      string
    releasePrecision: ReleasePrecision
    totalTracks:      number
    updatedAt:        Date
  }) {
    // Invariant 1 — date format must match precision
    const releaseDateStr = formatDate(params.releaseDate, params.releasePrecision)
    if (!isReleaseDateValid(releaseDateStr, params.releasePrecision)) {
      throw new Error(
        `releaseDate "${releaseDateStr}" does not match precision "${params.releasePrecision}". ` +
        `Expected format: ${String(RELEASE_PATTERNS[params.releasePrecision])}`
      )
    }

		this.albumType = params.albumType
		this.artistIds = params.artistIds
		this.createdAt = params.createdAt
		this.id = params.id
		this.isDeleted = params.isDeleted ?? false
		this.label = params.label
		this.name = params.name
		this.releaseDate = params.releaseDate
		this.releasePrecision = params.releasePrecision
		this.totalTracks = normaliseTotalTracks(params.albumType, params.totalTracks)
		this.updatedAt = params.updatedAt
	}
	public static create(params: {
		albumType: AlbumType
		artistIds: string[]
		isPublic?: boolean
		label: string
		name: string
		releaseDate: string
		releasePrecision: ReleasePrecision
		totalTracks: number
	}): Album {
		const now = new Date()
		return new Album({
			createdAt: now,
			id: crypto.randomUUID(),
			isDeleted: false,
			isPublic: params.isPublic ?? true,
			updatedAt: now,
			...params,
		})
	}
	public static restore(params: {
		albumType: AlbumType
		artistIds: string[]
		createdAt: Date
		id: string
		isDeleted: boolean
		isPublic: boolean
		label: string
		name: string
		releaseDate: string
		releasePrecision: ReleasePrecision
		totalTracks: number
		updatedAt: Date
	}): Album {
		return new Album(params)
	}
}

function formatDate(date: Date, precision: ReleasePrecision): string {
  const parts = date.toISOString().split('T')
  const iso = parts[0] ?? ''
  return (
    precision === 'day' ? iso :
    precision === 'month' ? iso.slice(0, 7) :
    iso.slice(0, 4)
  )
}

function isReleaseDateValid(releaseDate: string, precision: ReleasePrecision): boolean {
	return RELEASE_PATTERNS[precision].test(releaseDate)
}

function normaliseTotalTracks(albumType: AlbumType, totalTracks: number): number {
	return albumType === 'single' ? 1 : totalTracks
}

export default Album
