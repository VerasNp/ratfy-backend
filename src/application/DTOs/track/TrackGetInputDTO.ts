import { z } from 'zod'

export const TrackGetSchema = z.object({
  id: z.string().uuid(),
})

export type TrackGetInputDTO = z.infer<typeof TrackGetSchema>
