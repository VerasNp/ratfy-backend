import { z } from 'zod'

export const AddFavoriteTrackSchema = z.object({
  trackId: z.string().uuid(),
})

export type AddFavoriteTrackInputDTO = z.infer<typeof AddFavoriteTrackSchema>
