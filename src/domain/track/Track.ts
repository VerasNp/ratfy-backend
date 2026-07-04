import crypto from 'crypto'
// manage drm
export type ExternalIds = {
  ean?:  string
  isrc?: string
  upc?:  string
}

class Track {
  public readonly albumId:        string
  public readonly artistIds:      string[]
  public          audioFileKey:   string | null
  public          audioFileSize:  number | null
  public          audioContentType: string | null
  public readonly createdAt:      Date
  public readonly discNumber:     number
  public          drmEnabled:     boolean
  public readonly durationMs:     number
  public readonly explicit:       boolean
  public readonly externalIds:    ExternalIds
  public readonly id:             string
  public          isDeleted:      boolean
  public          isLocal:        boolean
  public          isPublic:       boolean
  public readonly name:           string
  public          popularity:     number
  public readonly trackNumber:    number
  public readonly updatedAt:      Date

  private constructor(params: {
    albumId:           string
    artistIds:         string[]
    audioFileKey:      string | null
    audioFileSize:     number | null
    audioContentType:  string | null
    createdAt:         Date
    discNumber:        number
    drmEnabled:        boolean
    durationMs:        number
    explicit:          boolean
    externalIds:       ExternalIds
    id:                string
    isDeleted:         boolean
    isLocal:           boolean
    isPublic:          boolean
    name:              string
    popularity:        number
    trackNumber:       number
    updatedAt:         Date
  }) {
    if (!isDurationValid(params.durationMs)) {
      throw new Error(
        `durationMs must be a non-negative integer, got "${String(params.durationMs)}"`
      )
    }
    if (!isTrackNumberValid(params.trackNumber)) {
      throw new Error(
        `trackNumber must be >= 1, got "${String(params.trackNumber)}"`
      )
    }
    if (!isTrackNumberValid(params.discNumber)) {
      throw new Error(
        `discNumber must be >= 1, got "${String(params.discNumber)}"`
      )
    }
    if (params.popularity < 0 || params.popularity > 100) {
      throw new Error(
        `popularity must be between 0 and 100, got "${String(params.popularity)}"`
      )
    }
    this.albumId           = params.albumId
    this.artistIds         = params.artistIds
    this.audioFileKey      = params.audioFileKey
    this.audioFileSize     = params.audioFileSize
    this.audioContentType  = params.audioContentType
    this.createdAt         = params.createdAt
    this.discNumber        = params.discNumber
    this.drmEnabled        = params.drmEnabled
    this.durationMs        = params.durationMs
    this.explicit          = params.explicit
    this.externalIds       = params.externalIds
    this.id                = params.id
    this.isDeleted         = params.isDeleted
    this.isLocal           = params.isLocal
    this.isPublic          = params.isPublic
    this.name              = params.name
    this.popularity        = params.popularity
    this.trackNumber       = params.trackNumber
    this.updatedAt         = params.updatedAt
  }
  public static create(params: {
    albumId:      string
    artistIds:    string[]
    discNumber?:  number
    durationMs:   number
    explicit:     boolean
    externalIds?: ExternalIds
    isLocal?:     boolean
    isPublic?:    boolean
    name:         string
    popularity?:  number
    trackNumber:  number
  }): Track {
    const now = new Date()
    return new Track({
      albumId:           params.albumId,
      artistIds:         params.artistIds,
      audioFileKey:      null,
      audioFileSize:     null,
      audioContentType:  null,
      createdAt:         now,
      discNumber:        params.discNumber   ?? 1,
      drmEnabled:        false,
      durationMs:        params.durationMs,
      explicit:          params.explicit,
      externalIds:       params.externalIds  ?? {},
      id:                crypto.randomUUID(),
      isDeleted:         false,
      isLocal:           params.isLocal      ?? false,
      isPublic:          params.isPublic     ?? true,
      name:              params.name,
      popularity:        params.popularity   ?? 0,
      trackNumber:       params.trackNumber,
      updatedAt:         now,
    })
  }
  public static restore(params: {
    albumId:           string
    artistIds:         string[]
    audioFileKey:      string | null
    audioFileSize:     number | null
    audioContentType:  string | null
    createdAt:         Date
    discNumber:        number
    drmEnabled:        boolean
    durationMs:        number
    explicit:          boolean
    externalIds:       ExternalIds
    id:                string
    isDeleted:         boolean
    isLocal:           boolean
    isPublic:          boolean
    name:              string
    popularity:        number
    trackNumber:       number
    updatedAt:         Date
  }): Track {
    return new Track(params)
  }
}
function isDurationValid(durationMs: number): boolean {
  return Number.isInteger(durationMs) && durationMs >= 0
}
function isTrackNumberValid(n: number): boolean {
  return Number.isInteger(n) && n >= 1
}
export default Track
