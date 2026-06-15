import { z } from 'zod'

export const ArtistDeleteSchema = z.object({
  id: z.string().uuid('Invalid Artist ID format. Must be a valid UUID.'),
})

export type ArtistDeleteInputDTO = z.infer<typeof ArtistDeleteSchema>