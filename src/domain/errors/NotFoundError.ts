import DomainError from './DomainError'

class NotFoundError extends DomainError {
	public constructor(message: string) {
		super(message || 'Not found error')
	}
}

export default NotFoundError
