import InfraError from './InfraError'

class ForbiddenError extends InfraError {
	public constructor(message: string) {
		super(message || 'Forbidden')
		this.name = 'ForbiddenError'
	}
}

export default ForbiddenError
