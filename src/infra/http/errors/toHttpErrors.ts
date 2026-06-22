import type ApplicationError from '#application/errors/ApplicationError.js'
import InvalidTokenError from '#application/errors/InvalidTokenError.js'
import MissingApplicationSetupError from '#application/errors/MissingApplicationSetupError.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import ExpiredJWTError from '#infra/security/errors/ExpiredJWTError.js'
import HttpError from './HttpError'

export default function toHttpErrors(error: ApplicationError) {
	if (error instanceof InvalidTokenError) {
		return new HttpError(401, error.message)
	}
	if (error instanceof UserNotFoundError) {
		return new HttpError(404, error.message)
	}
	if (error instanceof ResourceAlreadyExistsError) {
		console.log('Resource already exists error:', error.message)
		return new HttpError(409, error.message)
	}
	if (error instanceof UnauthorizedError || error instanceof ExpiredJWTError) {
		return new HttpError(401, error.message)
	}
	if (error instanceof MissingApplicationSetupError) {
		return new HttpError(500, error.message)
	}
	return new HttpError(500, 'Internal server error')
}
