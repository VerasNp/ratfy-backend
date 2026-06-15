import ApplicationError from "./ApplicationError"

export class ArtistNotFoundError extends ApplicationError {
  public readonly artistId: string

  constructor(id: string) {
    super(`Artist with id "${id}" not found`)
    this.name     = 'ArtistNotFoundError'
    this.artistId = id
    Object.setPrototypeOf(this, new.target.prototype)
  }
}