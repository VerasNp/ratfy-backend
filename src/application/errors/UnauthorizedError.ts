import ApplicationError from './ApplicationError'

class UnauthorizedError extends ApplicationError {
	public constructor(message?: string) {
		super(message || 'Unauthorized')
	}
}

export default UnauthorizedError
