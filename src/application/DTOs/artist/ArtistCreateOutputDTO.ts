/**
 * @swagger
 * components:
 *   schemas:
 *     ArtistCreateOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The newly created artist's unique identifier.
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The associated user's identifier.
 *         bio:
 *           type: string
 *           nullable: true
 *           description: The artist's biography.
 *         trackId:
 *           type: string
 *           nullable: true
 *           description: The artist's featured track ID.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of creation.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last update.
 */
export type ArtistCreateOutputDTO = {
  id:        string
  userId:    string
  bio:       string | null
  createdAt: Date
  updatedAt: Date
}