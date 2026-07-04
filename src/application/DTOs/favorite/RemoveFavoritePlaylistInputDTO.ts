import { z } from 'zod'

export const RemoveFavoritePlaylistSchema = z.object({
  playlistId: z.string().uuid(),
})

export type RemoveFavoritePlaylistInputDTO = z.infer<typeof RemoveFavoritePlaylistSchema>
