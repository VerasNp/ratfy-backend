import InfraError from './InfraError.js'

class BadRequestError extends InfraError {
	public constructor(message: string) {
		super(message || 'Bad Request')
		this.name = 'BadRequestError'
	}
}

export default BadRequestError
