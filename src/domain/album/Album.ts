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
    public          coverImageKey: string | null
    public          coverImageSize: number | null
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
    coverImageKey:    string | null
    coverImageSize:   number | null
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
    const dateStr = params.releaseDate.toISOString().split('T')[0] ?? ''
    if (!isReleaseDateValid(dateStr, params.releasePrecision)) {
      throw new Error(
        `releaseDate "${dateStr}" does not match precision "${params.releasePrecision}". ` +
        `Expected format: ${String(RELEASE_PATTERNS[params.releasePrecision])}`
      )
    }

    this.albumType        = params.albumType
    this.artistIds        = params.artistIds
    this.coverImageKey    = params.coverImageKey
    this.coverImageSize   = params.coverImageSize
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
      albumType:        params.albumType,
      artistIds:        params.artistIds,
      coverImageKey:    null,
      coverImageSize:   null,
      createdAt:        now,
      id:               crypto.randomUUID(),
      isDeleted:        false,
      isPublic:         params.isPublic ?? true,
      label:            params.label,
      name:             params.name,
      releaseDate:      params.releaseDate,
      releasePrecision: params.releasePrecision,
      totalTracks:      params.totalTracks,
      updatedAt:        now,
    })
  }
	public static restore(params: {
    albumType:        AlbumType
    artistIds:        string[]
    coverImageKey:    string | null
    coverImageSize:   number | null
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
