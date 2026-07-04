import { z } from 'zod'

export const RemoveFavoriteTrackSchema = z.object({
  trackId: z.string().uuid(),
})

export type RemoveFavoriteTrackInputDTO = z.infer<typeof RemoveFavoriteTrackSchema>
