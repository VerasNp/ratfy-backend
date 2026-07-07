import DomainError from './DomainError'

class TokenRevokedError extends DomainError {
	constructor(message?: string) {
		super(message || 'Token has been revoked')
		this.name = 'TokenRevokedError'
	}
}

export default TokenRevokedError
