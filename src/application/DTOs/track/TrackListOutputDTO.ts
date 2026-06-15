export type TrackListItemOutputDTO = {
  albumId:    string
  artistIds:  string[]
  discNumber: number
  durationMs: number
  explicit:   boolean
  id:         string
  isLocal:    boolean
  name:       string
  popularity: number
  trackNumber: number
}

export type TrackListOutputDTO = TrackListItemOutputDTO[]
