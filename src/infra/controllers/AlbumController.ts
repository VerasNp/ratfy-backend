import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type CreateAlbumUseCase from '#application/useCases/album/CreateAlbumUseCase.js'
import type DeleteAlbumUseCase from '#application/useCases/album/DeleteAlbumUseCase.js'
import type UpdateAlbumUseCase from '#application/useCases/album/UpdateAlbumUseCase.js'
import NotFoundError from '#infra/errors/NotFoundError.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import {
	AlbumCreateSchema,
	AlbumListSchema,
	AlbumUpdateSchema,
} from '#infra/http/schemas/AlbunsSchemas.js'

class AlbumController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly authMiddleware: AuthMiddleware,
		private readonly albumRepository: AlbumRepository,
		private readonly createAlbumUseCase: CreateAlbumUseCase,
		private readonly updateAlbumUseCase: UpdateAlbumUseCase,
		private readonly deleteAlbumUseCase: DeleteAlbumUseCase,
	) {
		this.httpServer.register(
			'get',
			'/albums',
			async (_params: any, _body: any, query: any) => {
				const input = AlbumListSchema.parse(query)
				const foundAlbums = await this.albumRepository.list(input.page, input.limit)
				return {
					body: foundAlbums,
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'post',
			'/albums',
			async (_params: any, body: any, _query: any) => {
				const input = AlbumCreateSchema.parse(body)
				const result = await this.createAlbumUseCase.execute(input)
				return {
					body: result,
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/albums/:albumId',
			async (params: any, _body: any, _query: any) => {
				const { albumId } = params
				const foundAlbum = await this.albumRepository.findById(albumId)
				if (!foundAlbum) {
					throw new NotFoundError(`Album not found`)
				}
				return {
					body: {
						id: foundAlbum.id,
						name: foundAlbum.name,
						albumType: foundAlbum.albumType,
						releaseDate: foundAlbum.releaseDate,
						releasePrecision: foundAlbum.releasePrecision,
						totalTracks: foundAlbum.totalTracks,
						label: foundAlbum.label,
					},
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'patch',
			'/albums/:albumId',
			async (params: any, body: any, _query: any) => {
				const { albumId } = params
				const input = AlbumUpdateSchema.parse(body)
				const result = await this.updateAlbumUseCase.execute(albumId, input)
				return {
					body: result,
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'delete',
			'/albums/:albumId',
			async (params: any, _body: any, _query: any) => {
				const { albumId } = params
				const result = await this.deleteAlbumUseCase.execute(albumId)
				return {
					body: result,
				}
			},
			[this.authMiddleware.handle()],
		)
	}
}

export default AlbumController
