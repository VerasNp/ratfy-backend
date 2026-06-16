import { z } from 'zod'

export const PlaylistListSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page:  z.coerce.number().int().min(1).default(1),
})

export type PlaylistListInputDTO = z.infer<typeof PlaylistListSchema>