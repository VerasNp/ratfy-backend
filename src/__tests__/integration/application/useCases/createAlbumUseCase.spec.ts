import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import CreateAlbumUseCase from '#application/useCases/album/CreateAlbumUseCase.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let albumRepository: AlbumRepository
let artistRepository: ArtistRepository
let createAlbumUseCase: CreateAlbumUseCase

describe('CreateAlbumUseCase', () => {
	let dummyArtists: Artist[]
	let dummyUsers: User[]
	beforeEach(() => {
		dummyArtists = []
		dummyUsers = []
		for (let i = 1; i <= 5; i++) {
			let dummyUser = createDummyUser({
				name: `User ${i}`,
				email: `foo${i}@bar.com`,
			})
			dummyUsers.push(dummyUser)
			let dummyArtist = createDummyArtist(dummyUser)
			dummyArtists.push(dummyArtist)
		}
		albumRepository = new AlbumRepositoryMemory()
		artistRepository = new ArtistRepositoryMemory(dummyArtists)
		createAlbumUseCase = new CreateAlbumUseCase(albumRepository, artistRepository)
	})
	it('should throw an error if an artist is not found', async () => {
		const input = {
			name: 'Test Album',
			albumType: 'album',
			releaseDate: '2023-01-01',
			releasePrecision: 'day',
			totalTracks: 10,
			label: 'Test Label',
			isPublic: true,
			artistIds: ['non-existent-artist-id'],
		}
		await expect(createAlbumUseCase.execute(input)).rejects.toThrowError(
			'One or more artists not found',
		)
	})
	it('should create an album', async () => {
		const input = {
			name: 'Test Album',
			albumType: 'album',
			releaseDate: '2023-01-01',
			releasePrecision: 'day',
			totalTracks: 10,
			label: 'Test Label',
			isPublic: true,
			artistIds: dummyArtists.slice(0, 2).map((artist) => artist.id),
		}
		const output = await createAlbumUseCase.execute(input)
		expect(output.id).toBeDefined()
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
					id: dummyArtists[0]!.id,
					name: dummyArtists[0]!.user!.name,
				}),
				expect.objectContaining({
					id: dummyArtists[1]!.id,
					name: dummyArtists[1]!.user!.name,
				}),
			]),
		)
	})
})
