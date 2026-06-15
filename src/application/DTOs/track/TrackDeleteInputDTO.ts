import { z } from 'zod'

export const TrackDeleteSchema = z.object({
  id: z.string().uuid(),
})

export type TrackDeleteInputDTO = z.infer<typeof TrackDeleteSchema>
