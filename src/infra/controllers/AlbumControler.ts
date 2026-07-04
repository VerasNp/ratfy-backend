import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import { AlbumListSchema } from '#infra/http/schemas/AlbunsSchemas.js'

class AlbumController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly authMiddleware: AuthMiddleware,
		private readonly albumRepository: AlbumRepository,
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
				//   const input = AlbumCreateSchema.parse(body)
				//   return this.createAlbumUseCase.execute(input)
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/albums/:id',
			async (params: any, _body: any, _query: any) => {
				//   const input = AlbumGetSchema.parse(params)
				//   return this.getAlbumUseCase.execute(input)
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'patch',
			'/albums/:id',
			async (params: any, body: any, _query: any) => {
				//   const { id } = AlbumGetSchema.parse(params)
				//   const input  = AlbumUpdateSchema.parse(body)
				//   return this.updateAlbumUseCase.execute(id, input)
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'delete',
			'/albums/:id',
			async (params: any, _body: any, _query: any) => {
				//   const input = AlbumDeleteSchema.parse(params)
				//   return this.deleteAlbumUseCase.execute(input)
			},
			[this.authMiddleware.handle()],
		)
	}
}

export default AlbumController
