import { z } from 'zod'

export const BecomeArtistSchema = z.object({
  bio: z.string().max(2000, 'Bio must be at most 2000 characters.').nullable().optional(),
})

export type BecomeArtistInputDTO = z.infer<typeof BecomeArtistSchema>
