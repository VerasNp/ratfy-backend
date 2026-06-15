class InfraError extends Error {
	public constructor(message: string) {
		super(message)
		this.name = this.constructor.name
	}
}

export default InfraError
