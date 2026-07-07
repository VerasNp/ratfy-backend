import DomainError from './DomainError'

class ValidationError extends DomainError {
	public constructor(message: string) {
		super(message || 'Validation error')
	}
}

export default ValidationError
