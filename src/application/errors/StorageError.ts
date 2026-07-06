import ApplicationError from './ApplicationError.js'

class StorageError extends ApplicationError {
  public constructor(message: string, public readonly cause?: unknown) {
    super(message, { cause })
    this.name = 'StorageError'
  }
}

export default StorageError
