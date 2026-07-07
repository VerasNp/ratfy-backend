import ApplicationError from './ApplicationError.js'

class ConcurrentUpdateError extends ApplicationError {
  public constructor(entityName: string) {
    super(`Concurrent update detected — ${entityName} was modified by another request`)
    this.name = 'ConcurrentUpdateError'
  }
}

export default ConcurrentUpdateError
