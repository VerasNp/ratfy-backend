import { z } from 'zod'

export const AlbumDeleteSchema = z.object({
  id: z.string().uuid(),
})

export type AlbumDeleteInputDTO = z.infer<typeof AlbumDeleteSchema>
