/**
 * @swagger
 * components:
 *   schemas:
 *     ArtistListItemOutput:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         bio:
 *           type: string
 *           nullable: true
 *           description: A short excerpt or the full biography.
 *     ArtistListOutput:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/ArtistListItemOutput'
 */
export type ArtistListItemOutputDTO = {
  id:     string
  userId: string
  bio:    string | null
}

export type ArtistListOutputDTO = ArtistListItemOutputDTO[]