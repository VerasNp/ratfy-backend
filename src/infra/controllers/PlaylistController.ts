import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import type { CreatePlaylistUseCase } from '#application/useCases/playlist/CreatePlaylist.js'
import type { UpdatePlaylistUseCase } from '#application/useCases/playlist/UpdatePlaylist.js'
import type { DeletePlaylistUseCase } from '#application/useCases/playlist/DeletePlaylist.js'
import type { AddTrackToPlaylistUseCase } from '#application/useCases/playlist/AddTrackToPlaylist.js'
import type { RemoveTrackFromPlaylistUseCase } from '#application/useCases/playlist/RemoveTrackFromPlaylist.js'
import NotFoundError from '#infra/errors/NotFoundError.js'
import {
	PlaylistListSchema,
	PlaylistCreateSchema,
	PlaylistUpdateSchema,
	PlaylistGetSchema,
	PlaylistAddTrackSchema,
	PlaylistRemoveTrackSchema,
} from '#infra/http/schemas/PlaylistsSchemas.js'

class PlaylistController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly playlistRepository: PlaylistRepository,
		private readonly authMiddleware: AuthMiddleware,
		private readonly createPlaylistUseCase: CreatePlaylistUseCase,
		private readonly updatePlaylistUseCase: UpdatePlaylistUseCase,
		private readonly deletePlaylistUseCase: DeletePlaylistUseCase,
		private readonly addTrackToPlaylistUseCase: AddTrackToPlaylistUseCase,
		private readonly removeTrackFromPlaylistUseCase: RemoveTrackFromPlaylistUseCase,
	) {
		this.httpServer.register(
			'get',
			'/playlists',
			async (_params: any, _body: any, query: any) => {
				const input = PlaylistListSchema.parse(query)
				const playlists = await this.playlistRepository.list(input.page, input.limit)
				return {
					body: playlists,
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'post',
			'/playlists',
			async (_params: any, body: any, _query: any) => {
				const input = PlaylistCreateSchema.parse(body)
				const result = await this.createPlaylistUseCase.execute(input)
				return {
					statusCode: 201,
					body: result,
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/playlists/:id',
			async (params: any, _body: any, _query: any) => {
				const { id } = PlaylistGetSchema.parse(params)
				const playlist = await this.playlistRepository.findById(id)
				if (!playlist) {
					throw new NotFoundError('Playlist not found')
				}
				return {
					body: {
						id: playlist.id,
						name: playlist.name,
						isPublic: playlist.isPublic,
						ownerId: playlist.ownerId,
						createdAt: playlist.createdAt,
						updatedAt: playlist.updatedAt,
					},
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/playlists/owner/:ownerId',
			async (params: any, _body: any, query: any) => {
				const { ownerId } = params
				const { page, limit } = PlaylistListSchema.parse(query)
				const playlists = await this.playlistRepository.listByOwnerId(ownerId, page, limit)
				return {
					body: playlists,
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'patch',
			'/playlists/:id',
			async (params: any, body: any, _query: any) => {
				const { id } = PlaylistGetSchema.parse(params)
				const input = PlaylistUpdateSchema.parse(body)
				const result = await this.updatePlaylistUseCase.execute(id, input)
				return {
					body: result,
				}
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'delete',
			'/playlists/:id',
			async (params: any, _body: any, _query: any) => {
				const { id } = PlaylistGetSchema.parse(params)
				await this.deletePlaylistUseCase.execute({ id })
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'post',
			'/playlists/:playlistId/tracks',
			async (params: any, body: any, _query: any) => {
				const input = PlaylistAddTrackSchema.parse({
					playlistId: params.playlistId,
					trackId: body.trackId,
				})
				await this.addTrackToPlaylistUseCase.execute(input)
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'delete',
			'/playlists/:playlistId/tracks/:trackId',
			async (params: any, _body: any, _query: any) => {
				const input = PlaylistRemoveTrackSchema.parse(params)
				await this.removeTrackFromPlaylistUseCase.execute(input)
			},
			[this.authMiddleware.handle()],
		)
	}
}

export default PlaylistController
