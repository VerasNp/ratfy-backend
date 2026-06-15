import { z } from 'zod'

export const ArtistGetSchema = z.object({
  id: z.string().uuid('Invalid Artist ID format. Must be a valid UUID.'),
})

export type ArtistGetInputDTO = z.infer<typeof ArtistGetSchema>