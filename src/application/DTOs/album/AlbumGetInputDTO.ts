import { z } from 'zod'

export const AlbumGetSchema = z.object({
  id: z.string().uuid(),
})

export type AlbumGetInputDTO = z.infer<typeof AlbumGetSchema>
