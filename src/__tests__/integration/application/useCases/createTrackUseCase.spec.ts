import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import CreateTrackUseCase from '#application/useCases/track/CreateTrackUseCase.js'
import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let trackRepository: TrackRepository
let albumRepository: AlbumRepository
let artistRepository: ArtistRepository
let createTrackUseCase: CreateTrackUseCase

describe('CreateTrackUseCase', () => {
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
			let dummyAlbum = createDummyAlbum({
				artists: [dummyArtist],
				name: `Album ${i}`,
			})
			dummyAlbuns.push(dummyAlbum)
		}
		albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
		trackRepository = new TrackRepositoryMemory()
		artistRepository = new ArtistRepositoryMemory(dummyArtists)
		createTrackUseCase = new CreateTrackUseCase(
			trackRepository,
			albumRepository,
			artistRepository,
			loggerPortMock,
		)
	})
	it('should throw an error if an album is not found', async () => {
		const input = {
			title: 'Test Track',
			durationMs: 300000,
			trackNumber: 1,
			isPublic: true,
			discNumber: 1,
			explicit: false,
			albumId: 'non-existent-album-id',
			artistIds: [dummyArtists[0]!.id],
		}
		await expect(createTrackUseCase.execute(input)).rejects.toThrowError('Album not found')
	})
	it('should throw an error if an artist is not found', async () => {
		const input = {
			title: 'Test Track',
			durationMs: 300000,
			trackNumber: 1,
			isPublic: true,
			discNumber: 1,
			explicit: false,
			albumId: dummyAlbuns[0]!.id,
			artistIds: ['non-existent-artist-id'],
		}
		await expect(createTrackUseCase.execute(input)).rejects.toThrowError(
			'One or more artists not found',
		)
	})
	it('should create a track', async () => {
		const input = {
			title: 'Test Track',
			durationMs: 300000,
			trackNumber: 1,
			isPublic: true,
			discNumber: 1,
			explicit: false,
			albumId: dummyAlbuns[0]!.id,
			artistIds: dummyArtists.slice(0, 2).map((artist) => artist.id),
		}

		const output = await createTrackUseCase.execute(input)
		expect(output.id).toBeDefined()
		expect(output.title).toBe(input.title)
		expect(output.durationMs).toBe(input.durationMs)
		expect(output.trackNumber).toBe(input.trackNumber)
		expect(output.isPublic).toBe(input.isPublic)
		expect(output.discNumber).toBe(input.discNumber)
		expect(output.explicit).toBe(input.explicit)
		expect(output.album.id).toBe(input.albumId)
		expect(output.artists).toEqual(
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
