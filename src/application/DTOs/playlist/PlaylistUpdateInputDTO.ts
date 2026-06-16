import { z } from 'zod'
import { PlaylistCreateSchema } from "./PlaylistCreateInputDTO.js"

export const PlaylistUpdateSchema = PlaylistCreateSchema
  .omit({ ownerId: true }) // Impede a transferência de posse da playlist
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )

export type PlaylistUpdateInputDTO = z.infer<typeof PlaylistUpdateSchema>