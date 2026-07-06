import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import GetTrackUseCase from '#application/useCases/track/GetTrackUseCase.js'
import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type Track from '#domain/track/Track.js'
import type User from '#domain/user/User.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let trackRepository: TrackRepository
let getTrackUseCase: GetTrackUseCase

describe('GetTrackUseCase', () => {
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
		getTrackUseCase = new GetTrackUseCase(trackRepository, loggerPortMock)
	})
	it('should throw an error if a track is not found', async () => {
		const nonExistentTrackId = 'non-existent-track-id'
		await expect(getTrackUseCase.execute(nonExistentTrackId)).rejects.toThrow('Track not found')
	})
	it('should get a track', async () => {
		const trackToGet = dummyTracks[0]!
		const result = await getTrackUseCase.execute(trackToGet.id)
		expect(result.title).toEqual(trackToGet.title)
		expect(result.album.id).toEqual(trackToGet.album!.id)
		expect(result.artists[0]!.id).toEqual(trackToGet.artists[0]!.id)
		expect(result.durationMs).toEqual(trackToGet.durationMs)
		expect(result.discNumber).toEqual(trackToGet.discNumber)
		expect(result.trackNumber).toEqual(trackToGet.trackNumber)
		expect(result.explicit).toEqual(trackToGet.explicit)
		expect(result.lyrics).toEqual(trackToGet.lyrics)
		expect(result.isPublic).toEqual(trackToGet.isPublic)
		expect(result.createdAt).toEqual(trackToGet.createdAt)
		expect(result.updatedAt).toEqual(trackToGet.updatedAt)
		expect(result.deletedAt).toEqual(trackToGet.deletedAt)
	})
})
