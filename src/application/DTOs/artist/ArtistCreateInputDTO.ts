import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     ArtistCreateInput:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier of the user who is becoming an artist.
 *         bio:
 *           type: string
 *           maxLength: 2000
 *           nullable: true
 *           description: An optional biography for the artist.
 *         trackId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: An optional ID of a track to be featured.
 */
export const ArtistCreateSchema = z.object({
  userId: z.string().uuid('Invalid User ID format. Must be a valid UUID.'),
  bio: z.string().max(2000, 'Bio must be at most 2000 characters.').nullable()
})

export type ArtistCreateInputDTO = z.infer<typeof ArtistCreateSchema>