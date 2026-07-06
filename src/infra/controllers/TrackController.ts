import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import { TrackCreateSchema, TrackSearchSchema, TrackUpdateSchema } from '#infra/http/schemas/TracksSchemas.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import type CreateTrackUseCase from '#application/useCases/track/CreateTrackUseCase.js'
import type GetTrackUseCase from '#application/useCases/track/GetTrackUseCase.js'
import UpdateTrackUseCase from '#application/useCases/track/UpdateTrackUseCase.js'
import DeleteTrackUseCase from '#application/useCases/track/DeleteTrackUseCase.js'

class TrackController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly trackRepository: TrackRepository,
		private readonly createTrackUseCase: CreateTrackUseCase,
		private readonly getTrackUseCase: GetTrackUseCase,
		private readonly updateTrackUseCase: UpdateTrackUseCase,
		private readonly deleteTrackUseCase: DeleteTrackUseCase,
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
				const input = TrackCreateSchema.parse(body)
				const result = await this.createTrackUseCase.execute(input)
				return {
					statusCode: 201,
					body: result,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/tracks/:trackId',
			async (params: any, _body: any, _query: any) => {
				const { trackId } = params
				const result = await this.getTrackUseCase.execute(trackId)
				return {
					body: result,
				}
			},
		)

		this.httpServer.register(
			'patch',
			'/tracks/:trackId',
			async (params: any, body: any, _query: any) => {
				const { trackId } = params
				const input = TrackUpdateSchema.parse(body)
				const result = await this.updateTrackUseCase.execute(trackId, input)
				return {
					body: result,
				}
			},
		)

		this.httpServer.register(
			'delete',
			'/tracks/:trackId',
			async (params: any, _body: any, _query: any) => {
				const { trackId } = params
				const result = await this.deleteTrackUseCase.execute(trackId)
				return {
					body: result,
				}
			},
		)
	}
}

export default TrackController
