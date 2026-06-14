import { z } from 'zod';

import { AlbumCreateSchema } from "./AlbumCreateDTO";

export const AlbumUpdateSchema = AlbumCreateSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )
export type UpdateAlbumDTO = z.infer<typeof AlbumUpdateSchema>
