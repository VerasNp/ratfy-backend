import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { fileTypeFromBuffer } from 'file-type'

import type { UploadAlbumCoverUseCase } from '#application/useCases/upload/UploadAlbumCoverUseCase.js'
import type { UploadArtistProfileImageUseCase } from '#application/useCases/upload/UploadArtistProfileImageUseCase.js'
import type { UploadPlaylistCoverUseCase } from '#application/useCases/upload/UploadPlaylistCoverUseCase.js'
import type { UploadTrackAudioUseCase } from '#application/useCases/upload/UploadTrackAudioUseCase.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import BadRequestError from '#infra/errors/BadRequestError.js'

const UPLOAD_RATE_LIMIT = rateLimit({
	windowMs: 60_000,
	max: 10,
	message: { error: 'Too many uploads, please try again later' },
})

const ALLOWED_AUDIO_TYPES = new Set([
	'audio/mpeg',
	'audio/mp4',
	'audio/wav',
	'audio/x-wav',
	'audio/flac',
	'audio/x-flac',
	'audio/ogg',
	'audio/x-m4a',
	'audio/aac',
	'audio/webm',
])

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

class UploadController {
	private upload: multer.Multer

	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly authMiddleware: AuthMiddleware,
		private readonly uploadTrackAudioUseCase: UploadTrackAudioUseCase,
		private readonly uploadAlbumCoverUseCase: UploadAlbumCoverUseCase,
		private readonly uploadArtistProfileImageUseCase: UploadArtistProfileImageUseCase,
		private readonly uploadPlaylistCoverUseCase: UploadPlaylistCoverUseCase,
		maxFileSize: number,
	) {
		this.upload = multer({ limits: { fileSize: maxFileSize }, storage: multer.memoryStorage() })

		this.httpServer.register(
			'post',
			'/tracks/:id/audio',
			async (params: any, _body: any, _query: any, req: any) => {
				const file = req.file as Express.Multer.File | undefined
				if (!file) throw new BadRequestError('No file provided')
				const type = await fileTypeFromBuffer(file.buffer)
				if (!type || !ALLOWED_AUDIO_TYPES.has(type.mime)) {
					throw new BadRequestError('Invalid or unsupported audio type')
				}

				const result = await this.uploadTrackAudioUseCase.execute(params.id, file.buffer, type.mime)

				return {
					body: result
				}
			},
			[this.authMiddleware.handle(), UPLOAD_RATE_LIMIT, this.upload.single('file')],
		)

		this.httpServer.register(
			'post',
			'/albums/:id/cover',
			async (params: any, _body: any, _query: any, req: any) => {
				const file = req.file as Express.Multer.File | undefined
				if (!file) throw new BadRequestError('No file provided')
				const type = await fileTypeFromBuffer(file.buffer)
				if (!type || !ALLOWED_IMAGE_TYPES.has(type.mime)) {
					throw new BadRequestError('Invalid or unsupported image type')
				}
				const result =  await this.uploadAlbumCoverUseCase.execute(params.id, file.buffer, type.mime)
				return {
					body: result
				}
			},
			[this.authMiddleware.handle(), UPLOAD_RATE_LIMIT, this.upload.single('file')],
		)

		this.httpServer.register(
			'post',
			'/artists/:id/profile-image',
			async (params: any, _body: any, _query: any, req: any) => {
				const file = req.file as Express.Multer.File | undefined
				if (!file) throw new BadRequestError('No file provided')
				const type = await fileTypeFromBuffer(file.buffer)
				if (!type || !ALLOWED_IMAGE_TYPES.has(type.mime)) {
					throw new BadRequestError('Invalid or unsupported image type')
				}

				const result = await this.uploadArtistProfileImageUseCase.execute(
					params.id,
					file.buffer,
					type.mime,
				)
				return {
					body: result
				}
			},
			[this.authMiddleware.handle(), UPLOAD_RATE_LIMIT, this.upload.single('file')],
		)

		this.httpServer.register(
			'post',
			'/playlists/:id/cover',
			async (params: any, _body: any, _query: any, req: any) => {
				const file = req.file as Express.Multer.File | undefined
				if (!file) throw new BadRequestError('No file provided')
				const type = await fileTypeFromBuffer(file.buffer)
				if (!type || !ALLOWED_IMAGE_TYPES.has(type.mime)) {
					throw new BadRequestError('Invalid or unsupported image type')
				}

				const result = await this.uploadPlaylistCoverUseCase.execute(params.id, file.buffer, type.mime)
				return {
					body: result
				}
			},
			[this.authMiddleware.handle(), UPLOAD_RATE_LIMIT, this.upload.single('file')],
		)
	}
}

export default UploadController
