import InfraError from '#infra/errors/InfraError.js'

class ExpiredJWTError extends InfraError {
	public constructor(message?: string) {
		super(message || 'JWT token has expired')
	}
}

export default ExpiredJWTError
