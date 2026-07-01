import InfraError from './InfraError'

class NotFoundError extends InfraError {
	public constructor(message?: string) {
		super(message || 'Resource not found')
	}
}

export default NotFoundError
