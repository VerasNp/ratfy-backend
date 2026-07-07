import ApplicationError from "./ApplicationError"

export class PlaylistNotFoundError extends ApplicationError {
  public readonly playlistId: string

  constructor(id: string) {
    super(`Playlist with id "${id}" not found`)
    this.name       = 'PlaylistNotFoundError'
    this.playlistId = id
    Object.setPrototypeOf(this, new.target.prototype)
  }
}