import { z } from 'zod'

export const RemoveFavoriteAlbumSchema = z.object({
  albumId: z.string().uuid(),
})

export type RemoveFavoriteAlbumInputDTO = z.infer<typeof RemoveFavoriteAlbumSchema>
