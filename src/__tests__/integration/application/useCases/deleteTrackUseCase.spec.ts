import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { favoriteRepositoryMock } from '#application/ports/__mocks__/FavoriteRepositoryMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import DeleteTrackUseCase from '#application/useCases/track/DeleteTrackUseCase.js'
import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type Track from '#domain/track/Track.js'
import type User from '#domain/user/User.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let trackRepository: TrackRepository
let deleteTrackUseCase: DeleteTrackUseCase

describe('DeleteTrackUseCase', () => {
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
			let dummyTrack = createDummyTrack({
				title: `Track ${i}`,
				album: dummyAlbum,
				artists: [dummyArtist],
			})
			dummyTracks.push(dummyTrack)
		}
		trackRepository = new TrackRepositoryMemory(dummyTracks)
		deleteTrackUseCase = new DeleteTrackUseCase(
			trackRepository,
			favoriteRepositoryMock,
			unitOfWorkMock,
			loggerPortMock,
		)
	})
	it('should throw an error if the track is not found', async () => {
		const nonExistentTrackId = 'non-existent-track-id'
		await expect(deleteTrackUseCase.execute(nonExistentTrackId)).rejects.toThrow(
			'Track not found',
		)
	})
	it('should delete a track', async () => {
		const trackToDelete = dummyTracks[0]!
		await deleteTrackUseCase.execute(trackToDelete.id)
		const exists = await trackRepository.findById(trackToDelete.id)
		expect(exists).toBeNull()
	})
})
