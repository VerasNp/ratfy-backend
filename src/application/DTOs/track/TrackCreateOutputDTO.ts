import type { ExternalIds } from '../../../domain/track/Track'

export type TrackCreateOutputDTO = {
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
