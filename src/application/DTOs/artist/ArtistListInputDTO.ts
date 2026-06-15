import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     ArtistListInput:
 *       type: object
 *       properties:
 *         limit:
 *           type: integer
 *           description: The maximum number of artists to return.
 *           default: 20
 *         page:
 *           type: integer
 *           description: The page number to retrieve.
 *           default: 1
 */
export const ArtistListSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page:  z.coerce.number().int().min(1).default(1),
})

export type ArtistListInputDTO = z.infer<typeof ArtistListSchema>