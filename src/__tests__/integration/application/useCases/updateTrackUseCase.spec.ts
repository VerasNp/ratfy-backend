import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import UpdateTrackUseCase from '#application/useCases/track/UpdateTrackUseCase.js'
import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type Track from '#domain/track/Track.js'
import type User from '#domain/user/User.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let trackRepository: TrackRepository
let updateTrackUseCase: UpdateTrackUseCase
let artistRepository: ArtistRepository
let albumRepository: AlbumRepository

describe('UpdateTrackUseCase', () => {
	let dummyUsers: User[] = []
	let dummyArtists: Artist[] = []
	let dummyAlbuns: Album[] = []
	let dummyTracks: Track[] = []
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
			for (let j = 1; j <= 6; j++) {
				let dummyTrack = createDummyTrack({
					album: dummyAlbum,
					artists: [dummyArtist],
					title: `Track ${j} of Album ${i}`,
				})
				dummyTracks.push(dummyTrack)
			}
		}
		trackRepository = new TrackRepositoryMemory(dummyTracks)
		artistRepository = new ArtistRepositoryMemory(dummyArtists)
		albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
		updateTrackUseCase = new UpdateTrackUseCase(
			trackRepository,
			albumRepository,
			artistRepository,
			loggerPortMock,
		)
	})
	it('should throw an error if a track is not found', async () => {
		const input = {
			title: 'Updated Track Title',
			durationMs: 250000,
			trackNumber: 2,
			isPublic: true,
			discNumber: 1,
			explicit: false,
			albumId: dummyAlbuns[0]!.id,
			artistIds: [dummyArtists[0]!.id],
		}
		const nonExistentTrackId = 'non-existent-track-id'
		await expect(
			updateTrackUseCase.execute(nonExistentTrackId, input),
		).rejects.toThrow('Track not found')
	})
	it("should throw an error if the album doesn't exist", async () => {
		const input = {
			title: 'Updated Track Title',
			durationMs: 250000,
			trackNumber: 2,
			isPublic: true,
			discNumber: 1,
			explicit: false,
			albumId: 'non-existent-album-id',
			artistIds: [dummyArtists[0]!.id],
		}
		const trackToUpdate = dummyTracks[0]!
		await expect(
			updateTrackUseCase.execute(trackToUpdate.id, input),
		).rejects.toThrow('Album not found')
	})
	it("should throw an error if one of the artists doesn't exist", async () => {
		const input = {
			title: 'Updated Track Title',
			durationMs: 250000,
			trackNumber: 2,
			isPublic: true,
			discNumber: 1,
			explicit: false,
			albumId: dummyAlbuns[0]!.id,
			artistIds: ['non-existent-artist-id'],
		}
		const trackToUpdate = dummyTracks[0]!
		await expect(
			updateTrackUseCase.execute(trackToUpdate.id, input),
		).rejects.toThrow('One or more artists not found')
	})
	it('should update a track', async () => {
		const input = {
			title: 'Updated Track Title',
			durationMs: 250000,
			trackNumber: 2,
			isPublic: true,
			discNumber: 1,
			explicit: false,
			albumId: dummyAlbuns[1]!.id,
			artistIds: [dummyArtists[1]!.id],
		}
		const trackToUpdate = dummyTracks[0]!
		const result = await updateTrackUseCase.execute(trackToUpdate.id, input)
		expect(result.title).toEqual(input.title)
		expect(result.durationMs).toEqual(input.durationMs)
		expect(result.trackNumber).toEqual(input.trackNumber)
		expect(result.isPublic).toEqual(input.isPublic)
		expect(result.discNumber).toEqual(input.discNumber)
		expect(result.explicit).toEqual(input.explicit)
		expect(result.album.id).toEqual(input.albumId)
		expect(result.artists[0]!.id).toEqual(input.artistIds[0])
	})
})
