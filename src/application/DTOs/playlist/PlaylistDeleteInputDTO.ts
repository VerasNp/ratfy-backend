import { z } from 'zod'

export const PlaylistDeleteSchema = z.object({
  id: z.string().uuid('Invalid Playlist ID format. Must be a valid UUID.'),
})

export type PlaylistDeleteInputDTO = z.infer<typeof PlaylistDeleteSchema>