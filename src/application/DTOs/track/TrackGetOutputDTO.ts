import type { ExternalIds } from '#domain/track/Track.js'

export type TrackGetOutputDTO = {
  albumId:     string
  artistIds:   string[]
  createdAt:   Date
  discNumber:  number
  durationMs:  number
  explicit:    boolean
  externalIds: ExternalIds
  id:          string
  isDeleted:   boolean
  isLocal:     boolean
  isPublic:    boolean
  name:        string
  popularity:  number
  trackNumber: number
  updatedAt:   Date
}
