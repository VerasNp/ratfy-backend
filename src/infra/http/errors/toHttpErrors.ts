import type ApplicationError from '#application/errors/ApplicationError.js'
import HttpError from './HttpError'

export default function toHttpErrors(error: ApplicationError) {
	switch (error.constructor.name) {
		case 'InvalidTokenError':
			return new HttpError(401, error.message)
		case 'UserNotFoundError':
			return new HttpError(404, error.message)
			case 'ResourceAlreadyExistsError':
			return new HttpError(409, error.message)
		default:
			return new HttpError(500, 'Internal server error')
	}
}
