import crypto from "crypto";

export type AlbumType =
	| 'album'
	| 'single'
export type ReleasePrecision =
	| 'day'
	| 'month'
	| 'year'

const RELEASE_PATTERNS: Record<ReleasePrecision, RegExp> = {
  day:   /^\d{4}-\d{2}-\d{2}$/,
  month: /^\d{4}-\d{2}$/,
  year:  /^\d{4}$/,
}

class Album {
    public readonly albumType: AlbumType
    public readonly artistIds: string[]
	public readonly createdAt: Date
	public readonly id: string
	public isDeleted?: boolean
	public isPublic: boolean
    public readonly label: string
    public readonly name: string
	public readonly releaseDate: Date
	public readonly releasePrecision: ReleasePrecision
	public totalTracks: number
	public updatedAt: Date
  private constructor(params: {
    albumType:        AlbumType
    artistIds:        string[]
    createdAt:        Date
    id:               string
    isDeleted?:		  boolean
    isPublic:         boolean
    label:            string
    name:             string
    releaseDate:      Date
    releasePrecision: ReleasePrecision
    totalTracks:      number
    updatedAt:        Date
  }) {
    // Invariant 1 — date format must match precision
    if (!isReleaseDateValid(params.releaseDate.toString(), params.releasePrecision)) {
      throw new Error(
        `releaseDate "${params.releaseDate.toString()}" does not match precision "${params.releasePrecision}". ` +
        `Expected format: ${String(RELEASE_PATTERNS[params.releasePrecision])}`
      )
    }

    this.albumType        = params.albumType
    this.artistIds        = params.artistIds
    this.createdAt        = params.createdAt
    this.id               = params.id
    this.isDeleted        = params.isDeleted ?? false
    this.isPublic         = params.isPublic
    this.label            = params.label
    this.name             = params.name
    this.releaseDate      = params.releaseDate
    this.releasePrecision = params.releasePrecision
    this.totalTracks      = normaliseTotalTracks(params.albumType, params.totalTracks)
    this.updatedAt        = params.updatedAt
  }
  public static create(params: {
	    albumType: AlbumType
	    artistIds: string[]
		isPublic?: boolean
	    label:            string
	    name:             string
	    releaseDate:      Date
	    releasePrecision: ReleasePrecision
	    totalTracks:      number
  }): Album {
    const now = new Date()
    return new Album({
      createdAt:        now,
      id:               crypto.randomUUID(),
      isDeleted:        false,
      isPublic:         params.isPublic ?? true,
      updatedAt:        now,
      ...params,
    })
  }
	public static restore(params: {
    albumType:        AlbumType
    artistIds:        string[]
    createdAt:        Date
    id:               string
    isDeleted:        boolean
    isPublic:         boolean
    label:            string
    name:             string
    releaseDate:      Date
    releasePrecision: ReleasePrecision
    totalTracks:      number
    updatedAt:        Date
  }): Album {
    return new Album(params)
  }
}

function isReleaseDateValid(releaseDate: string, precision: ReleasePrecision): boolean {
  return RELEASE_PATTERNS[precision].test(releaseDate)
}
function normaliseTotalTracks(albumType: AlbumType, totalTracks: number): number {
  return albumType === 'single' ? 1 : totalTracks
}

export default Album;
