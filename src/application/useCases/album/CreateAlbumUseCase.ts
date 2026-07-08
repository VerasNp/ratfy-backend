import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import Album from '#domain/album/Album.js'

class CreateAlbumUseCase {
	public constructor(
		private readonly albumRepository: AlbumRepository,
		private readonly artistRepository: ArtistRepository,
	) {}

	public async execute(input: Input): Promise<Output> {
		const artists = await this.artistRepository.listByIds(input.artistIds)
		if (artists.length !== input.artistIds.length) {
			throw new ResourceNotFoundError('One or more artists not found')
		}
		const album = Album.create({
			albumType: input.albumType,
			artists: artists,
			isPublic: input.isPublic,
			label: input.label,
			name: input.name,
			releaseDate: input.releaseDate,
			releasePrecision: input.releasePrecision,
			totalTracks: input.totalTracks,
		})
		const createdAlbum = await this.albumRepository.create(album)
		return {
			albumType: createdAlbum.albumType,
			id: createdAlbum.id,
			isPublic: createdAlbum.isPublic,
			label: createdAlbum.label,
			name: createdAlbum.name,
			releaseDate: createdAlbum.releaseDate,
			releasePrecision: createdAlbum.releasePrecision,
			totalTracks: createdAlbum.totalTracks,
			artistCredits: createdAlbum.artistCredits.map((artistCredit) => ({
				id: artistCredit.artistId,
				name: artistCredit.name,
			})),
		}
	}
}

export default CreateAlbumUseCase

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
