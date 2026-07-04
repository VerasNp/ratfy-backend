import { z } from 'zod'

export const RemoveFavoriteArtistSchema = z.object({
  artistId: z.string().uuid(),
})

export type RemoveFavoriteArtistInputDTO = z.infer<typeof RemoveFavoriteArtistSchema>
