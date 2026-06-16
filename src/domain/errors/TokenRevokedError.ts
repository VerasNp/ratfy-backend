class TokenRevokedError extends Error {
	constructor(message?: string) {
		super(message || 'Token has been revoked')
		this.name = 'TokenRevokedError'
	}
}

export default TokenRevokedError
