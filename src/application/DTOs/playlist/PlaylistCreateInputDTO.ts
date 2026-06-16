import { z } from 'zod'

export const PlaylistCreateSchema = z.object({
  name: z.string().min(1, 'Playlist name cannot be empty.').max(100, 'Name must be at most 100 characters.'),
  isPublic: z.boolean().optional().default(true),
  ownerId: z.string().uuid('Invalid Owner ID format. Must be a valid UUID.')
})

export type PlaylistCreateInputDTO = z.infer<typeof PlaylistCreateSchema>