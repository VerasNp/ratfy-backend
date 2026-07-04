import { z } from 'zod'

export const AddFavoriteArtistSchema = z.object({
  artistId: z.string().uuid(),
})

export type AddFavoriteArtistInputDTO = z.infer<typeof AddFavoriteArtistSchema>
