import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'

import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type Artist from '#domain/artist/Artist.js'
import {
	ArtistCreateSchema,
	ArtistListSchema,
	ArtistUpdateSchema,
} from '#infra/http/schemas/ArtistsSchemas.js'
import NotFoundError from '#infra/errors/NotFoundError.js'
import type CreateArtistUseCase from '#application/useCases/artist/CreateArtistUseCase.js'
import type UpdateArtistUseCase from '#application/useCases/artist/UpdateArtistUseCase.js'
import type DeleteArtistUseCase from '#application/useCases/artist/DeleteArtistUseCase.js'
import type { BecomeArtistUseCase } from '#application/useCases/artist/BecomeArtistUseCase.js'
import { BecomeArtistSchema } from '#application/DTOs/artist/BecomeArtistInputDTO.js'

class ArtistController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly artistRepository: ArtistRepository,
		private readonly createArtistUseCase: CreateArtistUseCase,
		private readonly updateArtistUseCase: UpdateArtistUseCase,
		private readonly deleteArtistUseCase: DeleteArtistUseCase,
		private readonly authMiddleware: AuthMiddleware,
		private readonly becomeArtistUseCase: BecomeArtistUseCase,
	) {
		this.httpServer.register(
			'get',
			'/artists',
			async (_params: any, _body: any, query: any) => {
				const input = ArtistListSchema.parse(query)
				const artists = input.query
					? await this.artistRepository.search(input.page, input.limit, input.query)
					: await this.artistRepository.list(input.page, input.limit)
				const result = artists.map((artist) => ({
					id: artist.id,
					bio: artist.bio,
					userId: artist.userId,
					user: {
						name: artist.user!.name,
					},
				}))
				return {
					body: result,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/artists/:artistId',
			async (params: any, _body: any, _query: any) => {
				const { artistId } = params
				const artist = await this.artistRepository.findById(artistId)
				if (!artist) {
					throw new NotFoundError('Artist not found')
				}
				return {
					body: {
						id: artist.id,
						bio: artist.bio,
						userId: artist.userId,
						user: {
							name: artist.user!.name,
						},
					},
				}
			},
		)

		this.httpServer.register(
			'post',
			'/artists',
			async (_params: any, body: any, _query: any) => {
				const input = ArtistCreateSchema.parse(body)
				const artist = await this.createArtistUseCase.execute(input)
				return {
					statusCode: 201,
					body: artist,
				}
			},
		)

		this.httpServer.register(
			'patch',
			'/artists/:artistId',
			async (params: any, body: any, _query: any) => {
				const { artistId } = params
				const input = ArtistUpdateSchema.parse(body)
				const updatedArtist = await this.updateArtistUseCase.execute(artistId, input)
				return {
					body: updatedArtist,
				}
			},
		)

		this.httpServer.register(
			'delete',
			'/artists/:artistId',
			async (params: any, _body: any, _query: any) => {
				const { artistId } = params
				const deletedArtist = await this.deleteArtistUseCase.execute({ id: artistId })
				return {
					body: deletedArtist,
				}
			},
		)

		this.httpServer.register(
			'post',
			'/become-artist',
			async (_params: any, body: any, _query: any, req: any) => {
				const { userId } = req.user
				const input = BecomeArtistSchema.parse(body)
				const artist = await this.becomeArtistUseCase.execute(userId, input)
				return { body: artist }
			},
			[this.authMiddleware.handle()],
		)
	}
}

export default ArtistController
