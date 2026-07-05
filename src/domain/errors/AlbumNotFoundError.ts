export class AlbumNotFoundError extends Error {
  constructor(id: string) {
    super(`Album with id "${id}" not found`)
    this.name = 'AlbumNotFoundError'
  }
}
