import { z } from 'zod'

export const TrackListSchema = z.object({
  albumId: z.string().uuid().optional(),   // filter tracks by album
  limit:   z.coerce.number().int().min(1).max(50).default(20),
  page:    z.coerce.number().int().min(1).default(1),
})

export type TrackListInputDTO = z.infer<typeof TrackListSchema>
