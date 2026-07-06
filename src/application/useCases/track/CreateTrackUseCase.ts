import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import Track from '#domain/track/Track.js'

class CreateTrackUseCase {
	public constructor(
		private readonly trackRepository: TrackRepository,
		private readonly albumRepository: AlbumRepository,
		private readonly artistRepository: ArtistRepository,
		private readonly loggerService: LoggerPort,
	) {}
	public async execute(input: Input): Promise<Output> {
		const foundAlbum = await this.albumRepository.findById(input.albumId)
		if (!foundAlbum) {
			this.loggerService.warn(`Album with ID ${input.albumId} not found for track creation`, {
				origin: 'CreateTrackUseCase',
			})
			throw new ResourceNotFoundError('Album not found')
		}
		const foundArtists = await this.artistRepository.listByIds(input.artistIds)
		if (foundArtists.length !== input.artistIds.length) {
			this.loggerService.warn(`One or more artists not found for track creation`, {
				origin: 'CreateTrackUseCase',
			})
			throw new ResourceNotFoundError('One or more artists not found')
		}
		const track = Track.create({
			album: foundAlbum,
			discNumber: input.discNumber,
			durationMs: input.durationMs,
			explicit: input.explicit,
			isPublic: input.isPublic,
			title: input.title,
			trackNumber: input.trackNumber,
			artists: foundArtists,
		})
		const createdTrack = await this.trackRepository.create(track)
		return {
			id: createdTrack.id,
			title: createdTrack.title,
			durationMs: createdTrack.durationMs,
			discNumber: createdTrack.discNumber,
			trackNumber: createdTrack.trackNumber,
			explicit: createdTrack.explicit,
			lyrics: createdTrack.lyrics,
			isPublic: createdTrack.isPublic,
			createdAt: createdTrack.createdAt,
			updatedAt: createdTrack.updatedAt,
			deletedAt: createdTrack.deletedAt,
			album: {
				id: createdTrack.album!.id,
				name: createdTrack.album!.name,
			},
			artists: createdTrack.artists.map((artist) => ({
				id: artist.id,
				name: artist.user!.name,
			})),
		}
	}
}

export default CreateTrackUseCase

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
