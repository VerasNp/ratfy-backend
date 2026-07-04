import type ApplicationError from '#application/errors/ApplicationError.js'
import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'
import InvalidTokenError from '#application/errors/InvalidTokenError.js'
import MissingApplicationSetupError from '#application/errors/MissingApplicationSetupError.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import StorageError from '#application/errors/StorageError.js'
import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import ValidationError from '#domain/errors/ValidationError.js'
import CacheError from '#application/errors/CacheError.js'
import ConcurrentUpdateError from '#application/errors/ConcurrentUpdateError.js'
import BadRequestError from '#infra/errors/BadRequestError.js'
import NotFoundError from '#infra/errors/NotFoundError.js'
import ExpiredJWTError from '#infra/security/errors/ExpiredJWTError.js'
import HttpError from './HttpError.js'

export default function toHttpErrors(error: ApplicationError) {
	if (error instanceof BadRequestError) {
		return new HttpError(400, error.message)
	}
	if (error instanceof InvalidTokenError) {
		return new HttpError(401, error.message)
	}
	if (error instanceof ValidationError) {
		return new HttpError(422, error.message)
	}
	if (
		error instanceof AlbumNotFoundError ||
		error instanceof ArtistNotFoundError ||
		error instanceof NotFoundError ||
		error instanceof PlaylistNotFoundError ||
		error instanceof ResourceNotFoundError ||
		error instanceof TrackNotFoundError ||
		error instanceof UserNotFoundError
	) {
		return new HttpError(404, error.message)
	}
	if (error instanceof ResourceAlreadyExistsError) {
		return new HttpError(409, error.message)
	}
	if (error instanceof CacheError || error instanceof StorageError) {
		return new HttpError(503, error.message)
	}
	if (error instanceof UnauthorizedError || error instanceof ExpiredJWTError) {
		return new HttpError(401, error.message)
	}
	if (error instanceof MissingApplicationSetupError) {
		return new HttpError(500, error.message)
	}
	if (error instanceof ConcurrentUpdateError) {
		return new HttpError(409, error.message)
	}
	return new HttpError(500, 'Internal server error')
}
