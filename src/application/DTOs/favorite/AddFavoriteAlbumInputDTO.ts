import { z } from 'zod'

export const AddFavoriteAlbumSchema = z.object({
  albumId: z.string().uuid(),
})

export type AddFavoriteAlbumInputDTO = z.infer<typeof AddFavoriteAlbumSchema>
