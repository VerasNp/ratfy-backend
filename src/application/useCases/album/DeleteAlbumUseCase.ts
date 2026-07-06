import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { UnitOfWork } from '#application/ports/UnitOfWork.js'

class DeleteAlbumUseCase {
	public constructor(
		private readonly albumRepository: AlbumRepository,
		private readonly favoriteRepository: FavoriteRepository,
		private readonly loggerService: LoggerPort,
		private readonly unitOfWork: UnitOfWork,
	) {}

	public async execute(albumId: string): Promise<Output> {
		const foundAlbum = await this.albumRepository.findById(albumId)
		if (!foundAlbum) {
			this.loggerService.warn(`Album with ID ${albumId} not found for deletion`, {
				origin: 'DeleteAlbumUseCase',
			})
			throw new ResourceNotFoundError('Album not found')
		}
		await this.unitOfWork.execute(async (tx) => {
			await this.albumRepository.delete(albumId, tx)
			await this.favoriteRepository.removeAllByEntity(albumId, 'ALBUM', tx)
		})
		this.loggerService.info(`Album with ID ${albumId} deleted successfully`, {
			origin: 'DeleteAlbumUseCase',
		})
		return {
			id: foundAlbum.id,
			name: foundAlbum.name,
			albumType: foundAlbum.albumType,
			releaseDate: foundAlbum.releaseDate,
			releasePrecision: foundAlbum.releasePrecision,
			totalTracks: foundAlbum.totalTracks,
			label: foundAlbum.label,
			isPublic: foundAlbum.isPublic,
			artistCredits: foundAlbum.artistCredits.map((artistCredit) => ({
				id: artistCredit.artist!.id,
				name: artistCredit.artist!.user!.name,
			})),
		}
	}
}

export default DeleteAlbumUseCase

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
