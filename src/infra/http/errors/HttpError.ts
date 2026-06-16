import InfraError from '#infra/shared/errors/InfraError.js'

class HttpError extends InfraError {
	public statusCode: number

	public constructor(statusCode: number, message?: string) {
		super(message || `HTTP Error with status code ${statusCode}`)
		this.statusCode = statusCode
	}
}

export default HttpError
