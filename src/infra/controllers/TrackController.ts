import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

import { TrackSearchSchema } from '#infra/http/schemas/TracksSchemas.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'

class TrackController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly trackRepository: TrackRepository,
		// private readonly createTrackUseCase: CreateTrackUseCase,
		// private readonly getTrackUseCase: GetTrackUseCase,
		// private readonly updateTrackUseCase: UpdateTrackUseCase,
		// private readonly deleteTrackUseCase: DeleteTrackUseCase,
		// private readonly listTracksUseCase: ListTracksUseCase,
	) {
		this.httpServer.register('get', '/tracks', async (_params: any, _body: any, query: any) => {
			const parsedQuery = TrackSearchSchema.parse(query)
			const foundTracks = await this.trackRepository.search(parsedQuery)
			const tracks = foundTracks.map((track) => ({
				id: track.id,
				title: track.title,
				durationMs: track.durationMs,
				discNumber: track.discNumber,
				trackNumber: track.trackNumber,
				explicit: track.explicit,
				lyrics: track.lyrics,
				isPublic: track.isPublic,
				createdAt: track.createdAt.toISOString(),
				updatedAt: track.updatedAt.toISOString(),
				deletedAt: track.deletedAt,
				album: track.album,
				artists: track.artists,
			}))
			return {
				body: tracks,
			}
		})

		this.httpServer.register(
			'post',
			'/tracks',
			async (_params: any, body: any, _query: any) => {
				// const input = TrackCreateSchema.parse(body)
				// return this.createTrackUseCase.execute(input)
			},
		)

		this.httpServer.register(
			'get',
			'/tracks/:trackId',
			async (params: any, _body: any, _query: any) => {
				// const { trackId } = params
				// return this.getTrackUseCase.execute(trackId)
			},
		)

		this.httpServer.register(
			'patch',
			'/tracks/:trackId',
			async (params: any, body: any, _query: any) => {
				const { trackId } = params
				// const input = TrackUpdateSchema.parse(body)
				// return this.updateTrackUseCase.execute(trackId, input)
			},
		)

		this.httpServer.register(
			'delete',
			'/tracks/:id',
			async (params: any, _body: any, _query: any) => {
				// const input = TrackDeleteSchema.parse(params)
				// return this.deleteTrackUseCase.execute(input)
			},
		)

		this.httpServer.register(
			'get',
			'/albums/:albumId/tracks',
			async (params: any, _body: any, query: any) => {
				const { albumId } = params
				// const input = TrackUpdateSchema.parse(params)
				// return this.listTracksUseCase.execute(input)
			},
		)
	}
}

export default TrackController
