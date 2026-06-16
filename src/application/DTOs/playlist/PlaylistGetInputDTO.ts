import { z } from 'zod'

export const PlaylistGetSchema = z.object({
  id: z.string().uuid('Invalid Playlist ID format. Must be a valid UUID.'),
})

export type PlaylistGetInputDTO = z.infer<typeof PlaylistGetSchema>