import { z } from 'zod'

const ExternalIdsSchema = z.object({
  ean:  z.string().optional(),
  isrc: z.string().optional(),
  upc:  z.string().optional(),
})

export const TrackCreateSchema = z.object({
  albumId:     z.string().uuid(),
  artistIds:   z.array(z.string().uuid()).min(1, 'At least one artist is required'),
  discNumber:  z.number().int().min(1).default(1),
  durationMs:  z.number().int().min(0),
  explicit:    z.boolean(),
  externalIds: ExternalIdsSchema.default({}),
  isLocal:     z.boolean().default(false),
  isPublic:    z.boolean().default(true),
  name:        z.string().min(1).max(500),
  popularity:  z.number().int().min(0).max(100).default(0),
  trackNumber: z.number().int().min(1),
})

export type TrackCreateInputDTO = z.infer<typeof TrackCreateSchema>
