import ApplicationError from "./ApplicationError"

class InvalidTokenError extends ApplicationError {
	public constructor(message?: string) {
		super(message || 'Invalid or expired token')
	}
}

export default InvalidTokenError
