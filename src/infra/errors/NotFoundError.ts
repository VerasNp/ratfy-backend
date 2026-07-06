import InfraError from './InfraError.js'

class NotFoundInfraError extends InfraError {
	public constructor(message?: string) {
		super(message || 'Resource not found')
	}
}

export default NotFoundInfraError
