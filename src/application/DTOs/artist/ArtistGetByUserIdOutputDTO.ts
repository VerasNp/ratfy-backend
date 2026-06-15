/**
 * @swagger
 * components:
 *   schemas:
 *     ArtistGetByUserIdOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the artist.
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier of the user associated with the artist.
 *         bio:
 *           type: string
 *           nullable: true
 *           description: The artist's biography.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the artist was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the artist was last updated.
 */
export type ArtistGetByUserIdOutputDTO = {
  id:        string
  userId:    string
  bio:       string | null
  createdAt: Date
  updatedAt: Date
}