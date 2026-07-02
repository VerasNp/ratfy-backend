import { z } from 'zod'

export const AddFavoritePlaylistSchema = z.object({
  playlistId: z.string().uuid(),
})

export type AddFavoritePlaylistInputDTO = z.infer<typeof AddFavoritePlaylistSchema>
