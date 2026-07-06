import ValidationError from '#domain/errors/ValidationError.js'
import crypto from "crypto"

class Playlist {
  public readonly id: string
  public name: string
  public isPublic: boolean
  public readonly ownerId: string
  public coverImageKey: string | null
  public coverImageSize: number | null
  public readonly createdAt: Date
  public updatedAt: Date

  private constructor(params: {
    id: string
    name: string
    isPublic: boolean
    ownerId: string
    coverImageKey: string | null
    coverImageSize: number | null
    createdAt: Date
    updatedAt: Date
  }) {
    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError("Playlist name cannot be empty.")
    }

    if (params.name.length > 100) {
      throw new ValidationError("Playlist name exceeds the maximum allowed length of 100 characters.")
    }

    this.id = params.id
    this.name = params.name
    this.isPublic = params.isPublic
    this.ownerId = params.ownerId
    this.coverImageKey = params.coverImageKey
    this.coverImageSize = params.coverImageSize
    this.createdAt = params.createdAt
    this.updatedAt = params.updatedAt
  }

  public static create(params: {
    name: string
    ownerId: string
    isPublic?: boolean
  }): Playlist {
    const now = new Date()
    return new Playlist({
      id: crypto.randomUUID(),
      name: params.name,
      isPublic: params.isPublic ?? true,
      ownerId: params.ownerId,
      coverImageKey: null,
      coverImageSize: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  public static restore(params: {
    id: string
    name: string
    isPublic: boolean
    ownerId: string
    coverImageKey: string | null
    coverImageSize: number | null
    createdAt: Date
    updatedAt: Date
  }): Playlist {
    return new Playlist(params)
  }
}

export default Playlist