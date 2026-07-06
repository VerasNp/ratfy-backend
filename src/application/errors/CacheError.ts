import ApplicationError from './ApplicationError.js'

class CacheError extends ApplicationError {
  public constructor(message: string, public readonly cause?: unknown) {
    super(message, { cause })
    this.name = 'CacheError'
  }
}

export default CacheError
