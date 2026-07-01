import ApplicationError from './ApplicationError'

class ResourceNotFoundError extends ApplicationError {
	public constructor(message?: string) {
		super(message || 'Resource not found')
		this.name = 'ResourceNotFoundError'
	}
}

export default ResourceNotFoundError
