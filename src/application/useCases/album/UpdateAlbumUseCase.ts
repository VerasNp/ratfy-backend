import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'

class UpdateAlbumUseCase {
	public constructor(
		private readonly albumRepository: AlbumRepository,
		private readonly artistRepository: ArtistRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(albumId: string, input: Input): Promise<Output> {
		const foundArtists = await this.artistRepository.listByIds(input.artistIds)
		if (foundArtists.length !== input.artistIds.length) {
			this.loggerService.warn(`One or more artists not found for album update`, {
				origin: 'UpdateAlbumUseCase',
			})
			throw new ResourceNotFoundError('One or more artists not found')
		}
		const foundAlbum = await this.albumRepository.findById(albumId)
		if (!foundAlbum) {
			this.loggerService.warn(`Album with ID ${albumId} not found for update`, {
				origin: 'UpdateAlbumUseCase',
			})
			throw new ResourceNotFoundError('Album not found')
		}
		const albumToUpdate = {
			...input,
			artists: foundArtists,
		}
		foundAlbum.updateData(albumToUpdate)
		const updatedAlbum = await this.albumRepository.update(albumId, input)
		this.loggerService.info(`Album with ID ${albumId} updated successfully`, {
			origin: 'UpdateAlbumUseCase',
		})
		return {
			albumType: updatedAlbum!.albumType,
			id: updatedAlbum!.id,
			isPublic: updatedAlbum!.isPublic,
			label: updatedAlbum!.label,
			name: updatedAlbum!.name,
			releaseDate: updatedAlbum!.releaseDate,
			releasePrecision: updatedAlbum!.releasePrecision,
			totalTracks: updatedAlbum!.totalTracks,
			artistCredits: updatedAlbum!.artistCredits.map((artistCredit) => ({
				id: artistCredit.artist!.id,
				name: artistCredit.artist!.user!.name,
			})),
		}
	}
}

export default UpdateAlbumUseCase

type Input = {
	name: string
	albumType: string
	releaseDate: string
	releasePrecision: string
	totalTracks: number
	label: string
	isPublic: boolean
	artistIds: string[]
}

type Output = {
	id: string
	name: string
	albumType: string
	releaseDate: string
	releasePrecision: string
	totalTracks: number
	label: string
	isPublic: boolean
	artistCredits: { id: string; name: string }[]
}
