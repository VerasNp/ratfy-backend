import type { TrackRepository } from '#application/ports/TrackRepository.js'
import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'

class UpdateTrackUseCase {
	public constructor(
		private readonly trackRepository: TrackRepository,
		private readonly albumRepository: AlbumRepository,
		private readonly artistRepository: ArtistRepository,
		private readonly loggerService: LoggerPort,
	) {}
	public async execute(trackId: string, input: Input): Promise<Output> {
		const foundTrack = await this.trackRepository.findById(trackId)
		if (!foundTrack) {
			this.loggerService.warn(`Track with ID ${trackId} not found for update`, {
				origin: 'UpdateTrackUseCase',
			})
			throw new ResourceNotFoundError('Track not found')
		}
		const foundAlbum = await this.albumRepository.findById(input.albumId)
		if (!foundAlbum) {
			this.loggerService.warn(`Album with ID ${input.albumId} not found for track update`, {
				origin: 'UpdateTrackUseCase',
			})
			throw new ResourceNotFoundError('Album not found')
		}
		const foundArtists = await this.artistRepository.listByIds(input.artistIds)
		if (foundArtists.length !== input.artistIds.length) {
			this.loggerService.warn(`One or more artists not found for track update`, {
				origin: 'UpdateTrackUseCase',
			})
			throw new ResourceNotFoundError('One or more artists not found')
		}
		foundTrack.updateData({
			...input,
			album: foundAlbum,
			artists: foundArtists,
		})
		const updatedTrack = await this.trackRepository.update(trackId, foundTrack)
		this.loggerService.info(`Track with ID ${trackId} updated successfully`, {
			origin: 'UpdateTrackUseCase',
		})
		return {
			id: updatedTrack!.id,
			title: updatedTrack!.title,
			durationMs: updatedTrack!.durationMs,
			discNumber: updatedTrack!.discNumber,
			trackNumber: updatedTrack!.trackNumber,
			explicit: updatedTrack!.explicit,
			lyrics: updatedTrack!.lyrics,
			isPublic: updatedTrack!.isPublic,
			createdAt: updatedTrack!.createdAt,
			updatedAt: updatedTrack!.updatedAt,
			deletedAt: updatedTrack!.deletedAt,
			album: {
				id: updatedTrack!.album!.id,
				name: updatedTrack!.album!.name,
			},
			artists: updatedTrack!.artists.map((artist) => ({
				id: artist.id,
				name: artist.user!.name,
			})),
		}
	}
}

export default UpdateTrackUseCase

type Input = {
	albumId: string
	discNumber: number
	durationMs: number
	explicit: boolean
	isPublic: boolean
	title: string
	trackNumber: number
	artistIds: string[]
}

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
