import ApplicationError from './ApplicationError'

class ResourceAlreadyExistsError extends ApplicationError {
	public constructor(message?: string) {
		super(message || 'Resource already exists')
	}
}

export default ResourceAlreadyExistsError
