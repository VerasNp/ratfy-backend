import DomainError from './DomainError.js'

class UniqueConstraintError extends DomainError {
	public constructor(message: string) {
		super(message)
	}
}

export default UniqueConstraintError
