import crypto from "crypto"

/**
 * @swagger
 * components:
 *   schemas:
 *     Artist:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the artist.
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier of the user who became an artist.
 *         bio:
 *           type: string
 *           nullable: true
 *           description: The biography of the artist.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the artist was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the artist was last updated.
 */
class Artist {
  public readonly id: string
  public readonly userId: string
  public bio: string | null
  public readonly createdAt: Date
  public updatedAt: Date

  private constructor(params: {
    id: string
    userId: string
    bio?: string | null
    createdAt: Date
    updatedAt: Date
  }) {
    if (params.bio && params.bio.length > 2000) {
      throw new Error(
        `Artist bio exceeds the maximum allowed length of 2000 characters.`
      )
    }

    this.id = params.id
    this.userId = params.userId
    this.bio = params.bio ?? null
    this.createdAt = params.createdAt
    this.updatedAt = params.updatedAt
  }

  public static create(params: {
    userId: string
    bio?: string | null
  }): Artist {
    const now = new Date()
    return new Artist({
      id: crypto.randomUUID(),
      userId: params.userId,
      bio: params.bio ?? null,
      createdAt: now,
      updatedAt: now,
    })
  }

  public static restore(params: {
    id: string
    userId: string
    bio: string | null
    createdAt: Date
    updatedAt: Date
  }): Artist {
    return new Artist(params)
  }
}

export default Artist