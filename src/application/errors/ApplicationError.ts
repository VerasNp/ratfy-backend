class ApplicationError extends Error {
	public constructor(message: string, options?: ErrorOptions) {
		super(message, options)
		this.name = this.constructor.name
	}
}

export default ApplicationError
