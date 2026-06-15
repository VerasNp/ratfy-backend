import { z } from 'zod'

export const ArtistGetByUserIdSchema = z.object({
  userId: z.string().uuid('Invalid User ID format. Must be a valid UUID.'),
})

export type ArtistGetByUserIdInputDTO = z.infer<typeof ArtistGetByUserIdSchema>