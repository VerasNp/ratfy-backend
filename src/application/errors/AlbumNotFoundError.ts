import ApplicationError from "./ApplicationError"

export class AlbumNotFoundError extends ApplicationError {
  public readonly albumId: string

  constructor(id: string) {
    super(`Album with id "${id}" not found`)
    this.name    = 'AlbumNotFoundError'
    this.albumId = id
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
