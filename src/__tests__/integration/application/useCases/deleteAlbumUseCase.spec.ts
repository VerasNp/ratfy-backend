import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { favoriteRepositoryMock } from '#application/ports/__mocks__/FavoriteRepositoryMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import DeleteAlbumUseCase from '#application/useCases/album/DeleteAlbumUseCase.js'
import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let deleteAlbumUseCase: DeleteAlbumUseCase
let albumRepository: AlbumRepository

describe('DeleteAlbumUseCase', () => {
	let dummyUsers: User[] = []
	let dummyArtists: Artist[] = []
	let dummyAlbuns: Album[] = []
	beforeEach(() => {
		for (let i = 1; i <= 5; i++) {
			let dummyUser = createDummyUser({
				name: `User ${i}`,
				email: `foo${i}@bar.com`,
			})
			dummyUsers.push(dummyUser)
			let dummyArtist = createDummyArtist(dummyUser)
			dummyArtists.push(dummyArtist)
		}
		for (let i = 1; i <= 30; i++) {
			const dummyAlbum = createDummyAlbum({
				artists: dummyArtists.slice(0, 2),
				name: `Album ${i}`,
				albumType: 'album',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 10,
				label: 'Test Label',
				isPublic: true,
			})
			dummyAlbuns.push(dummyAlbum)
		}
		albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
		deleteAlbumUseCase = new DeleteAlbumUseCase(
			albumRepository,
			favoriteRepositoryMock,
			loggerPortMock,
			unitOfWorkMock,
		)
	})
	it('should throw an error if the album is not found', async () => {
		const nonExistentAlbumId = 'non-existent-album-id'
		await expect(deleteAlbumUseCase.execute(nonExistentAlbumId)).rejects.toThrow(
			'Album not found',
		)
	})
	it('should delete an album', async () => {
		const albumToDelete = dummyAlbuns[0]!
		await deleteAlbumUseCase.execute(albumToDelete.id)
		const deletedAlbum = await albumRepository.findById(albumToDelete.id)
		expect(deletedAlbum).toBeNull()
	})
})
