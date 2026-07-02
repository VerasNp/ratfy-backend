import type ApplicationError from '#application/errors/ApplicationError.js'
import InvalidTokenError from '#application/errors/InvalidTokenError.js'
import MissingApplicationSetupError from '#application/errors/MissingApplicationSetupError.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import ValidationError from '#domain/errors/ValidationError.js'
import BadRequestError from '#infra/errors/BadRequestError.js'
import ForbiddenError from '#infra/errors/ForbiddenError.js'
import NotFoundError from '#infra/errors/NotFoundError.js'
import ExpiredJWTError from '#infra/security/errors/ExpiredJWTError.js'
import HttpError from './HttpError'

export default function toHttpErrors(error: ApplicationError) {
	if (error instanceof BadRequestError) {
		return new HttpError(400, error.message)
	}
	if (error instanceof ForbiddenError) {
		return new HttpError(403, error.message)
	}
	if (error instanceof InvalidTokenError) {
		return new HttpError(401, error.message)
	}
	if (error instanceof ValidationError) {
		return new HttpError(422, error.message)
	}
	if (
		error instanceof UserNotFoundError ||
		error instanceof NotFoundError ||
		error instanceof ResourceNotFoundError
	) {
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
