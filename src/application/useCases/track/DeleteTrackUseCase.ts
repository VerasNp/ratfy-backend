import type { TrackRepository } from '#application/ports/TrackRepository.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { UnitOfWork } from '#application/ports/UnitOfWork.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'

class DeleteTrackUseCase {
	public constructor(
		private readonly trackRepository: TrackRepository,
		private readonly favoriteRepository: FavoriteRepository,
		private readonly unitOfWork: UnitOfWork,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(trackId: string): Promise<Output> {
		const foundTrack = await this.trackRepository.findById(trackId)
		if (!foundTrack) {
			this.loggerService.warn(`Track with ID ${trackId} not found for deletion`, {
				origin: 'DeleteTrackUseCase',
			})
			throw new ResourceNotFoundError('Track not found')
		}
		this.unitOfWork.execute(async (tx) => {
			await this.trackRepository.delete(trackId, tx)
			await this.favoriteRepository.removeAllByEntity(trackId, 'TRACK', tx)
		})
		this.loggerService.info(`Track with ID ${trackId} deleted successfully`, {
			origin: 'DeleteTrackUseCase',
		})
		return {
			id: foundTrack.id,
			title: foundTrack.title,
			durationMs: foundTrack.durationMs,
			discNumber: foundTrack.discNumber,
			trackNumber: foundTrack.trackNumber,
			explicit: foundTrack.explicit,
			lyrics: foundTrack.lyrics,
			isPublic: foundTrack.isPublic,
			createdAt: foundTrack.createdAt,
			updatedAt: foundTrack.updatedAt,
			deletedAt: foundTrack.deletedAt,
			album: {
				id: foundTrack.album!.id,
				name: foundTrack.album!.name,
			},
			artists: foundTrack.artists.map((artist) => ({
				id: artist.id,
				name: artist.user!.name,
			})),
		}
	}
}

export default DeleteTrackUseCase

type Output = {
	id: string
	title: string
	durationMs: number
	discNumber: number
	trackNumber: number
	explicit: boolean
	lyrics: string | null
	isPublic: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	album: {
		id: string
		name: string
	}
	artists: {
		id: string
		name: string
	}[]
}
