import { z } from 'zod'

import { TrackCreateSchema } from './TrackCreateInputDTO'

export const TrackUpdateSchema = TrackCreateSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )

export type TrackUpdateInputDTO = z.infer<typeof TrackUpdateSchema>
