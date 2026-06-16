import { z } from 'zod'
import { PlaylistListSchema } from './PlaylistListInputDTO.js'

export const PlaylistListByOwnerIdSchema = PlaylistListSchema.extend({
  ownerId: z.string().uuid('Invalid Owner ID format. Must be a valid UUID.'),
})

export type PlaylistListByOwnerIdInputDTO = z.infer<typeof PlaylistListByOwnerIdSchema>