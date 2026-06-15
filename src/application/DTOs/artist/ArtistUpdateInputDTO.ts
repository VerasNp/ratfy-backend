import { z } from 'zod'
import { ArtistCreateSchema } from "./ArtistCreateInputDTO"

/**
 * @swagger
 * components:
 *   schemas:
 *     ArtistUpdateInput:
 *       type: object
 *       properties:
 *         bio:
 *           type: string
 *           maxLength: 2000
 *           nullable: true
 *           description: The updated biography of the artist.
 */
export const ArtistUpdateSchema = ArtistCreateSchema
  .omit({ userId: true })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )

export type ArtistUpdateInputDTO = z.infer<typeof ArtistUpdateSchema>