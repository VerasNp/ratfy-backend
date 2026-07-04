import InfraError from './InfraError.js'

class NotFoundError extends InfraError {
	public constructor(message?: string) {
		super(message || 'Resource not found')
	}
}

export default NotFoundError
