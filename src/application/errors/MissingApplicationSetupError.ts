import ApplicationError from './ApplicationError'

class MissingApplicationSetupError extends ApplicationError {
	constructor(message: string) {
		super(
			message ||
				'Application setup is missing. Please ensure all necessary components are properly configured.',
		)
		this.name = 'MissingApplicationSetupError'
	}
}

export default MissingApplicationSetupError
