import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import UpdateAlbumUseCase from '#application/useCases/album/UpdateAlbumUseCase.js'
import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let updateAlbumUseCase: UpdateAlbumUseCase
let albumRepository: AlbumRepository
let artistRepository: ArtistRepository

describe('UpdateAlbumUseCase', () => {
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
		artistRepository = new ArtistRepositoryMemory(dummyArtists)
		updateAlbumUseCase = new UpdateAlbumUseCase(albumRepository, artistRepository, loggerPortMock)
	})
	it('should throw an error if an artist is not found', async () => {
		const input = {
			name: 'Updated Album Name',
			albumType: 'ep',
			releaseDate: '2023-01-01',
			releasePrecision: 'day',
			totalTracks: 3,
			label: 'Updated Label',
			isPublic: true,
			artistIds: ['non-existent-artist-id'],
		}
		await expect(updateAlbumUseCase.execute(dummyAlbuns[0]!.id, input)).rejects.toThrowError(
			'One or more artists not found',
		)
	})
	it("should throw an error if the album doesn't exist", async () => {
		const input = {
			name: 'Updated Album Name',
			albumType: 'Updated Album Type',
			releaseDate: '2023-01-01',
			releasePrecision: 'day',
			totalTracks: 10,
			label: 'Updated Label',
			isPublic: true,
			artistIds: [dummyArtists[3]!.id, dummyArtists[4]!.id],
		}
		await expect(updateAlbumUseCase.execute('non-existent-album-id', input)).rejects.toThrow(
			new ResourceNotFoundError('Album not found'),
		)
	})
	it('should update an album', async () => {
		const input = {
			name: 'Updated Album Name',
			albumType: 'ep',
			releaseDate: '2023-01-01',
			releasePrecision: 'day',
			totalTracks: 4,
			label: 'Updated Label',
			isPublic: true,
			artistIds: [dummyArtists[3]!.id, dummyArtists[4]!.id],
		}
		const output = await updateAlbumUseCase.execute(dummyAlbuns[0]!.id, input)
		expect(output.id).toBe(dummyAlbuns[0]!.id)
		expect(output.name).toBe(input.name)
		expect(output.albumType).toBe(input.albumType)
		expect(output.releaseDate).toBe(input.releaseDate)
		expect(output.releasePrecision).toBe(input.releasePrecision)
		expect(output.totalTracks).toBe(input.totalTracks)
		expect(output.label).toBe(input.label)
		expect(output.isPublic).toBe(input.isPublic)
		expect(output.artistCredits).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: dummyArtists[3]!.id,
					name: dummyArtists[3]!.user!.name,
				}),
				expect.objectContaining({
					id: dummyArtists[4]!.id,
					name: dummyArtists[4]!.user!.name,
				}),
			]),
		)
	})
})
