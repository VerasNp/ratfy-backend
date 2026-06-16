import { z } from 'zod';

import { AlbumCreateSchema } from "./AlbumCreateInputDTO";

export const AlbumUpdateSchema = z.object({ ...AlbumCreateSchema.shape })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )

export type AlbumUpdateInputDTO = z.infer<typeof AlbumUpdateSchema>
