import ApplicationError from "./ApplicationError"

export class TrackNotFoundError extends ApplicationError {
  public readonly trackId: string

  constructor(id: string) {
    super(`Track with id "${id}" not found`)
    this.name    = 'TrackNotFoundError'
    this.trackId = id
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
