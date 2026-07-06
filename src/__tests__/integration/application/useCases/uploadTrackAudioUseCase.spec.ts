import { storagePortMock } from '#application/ports/__mocks__/StoragePortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { UploadTrackAudioUseCase } from '#application/useCases/upload/UploadTrackAudioUseCase.js'
import Track from '#domain/track/Track.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'

let useCase: UploadTrackAudioUseCase
let trackRepo: TrackRepositoryMemory
let dummyTrack: Track
let dummyAlbum: Album
let dummyArtist: Artist

beforeEach(() => {
	trackRepo = new TrackRepositoryMemory()
	vi.clearAllMocks()
	dummyArtist = createDummyArtist(createDummyUser({ name: 'Artist User', email: 'foo@bar.com' }))
	dummyAlbum = createDummyAlbum({
		artists: [dummyArtist],
	})
	dummyTrack = createDummyTrack({
		title: 'Test Track',
		durationMs: 180000,
		discNumber: 1,
		trackNumber: 1,
		explicit: false,
		lyrics: null,
		isPublic: true,
		album: dummyAlbum,
		artists: [dummyArtist],
	})
	trackRepo.create(dummyTrack)
	useCase = new UploadTrackAudioUseCase(trackRepo, storagePortMock, loggerPortMock, 'audio')
})

describe('UploadTrackAudioUseCase', () => {
	it('should upload audio and update track', async () => {
		vi.mocked(storagePortMock.upload).mockResolvedValue('http://storage/audio/file.mp3')

		const fileData = Buffer.from('fake-audio-data')
		const result = await useCase.execute(dummyTrack.id, fileData, 'audio/mpeg')

		expect(result.audioFileKey).toMatch(/^tracks\/.+\.mp3$/)
		expect(result.audioFileSize).toBe(fileData.length)
		expect(result.audioContentType).toBe('audio/mpeg')
		expect(storagePortMock.upload).toHaveBeenCalledOnce()

		const updated = await trackRepo.findById(dummyTrack.id)
		expect(updated!.audioFileKey).toBe(result.audioFileKey)
		expect(updated!.audioFileSize).toBe(fileData.length)
		expect(updated!.audioContentType).toBe('audio/mpeg')
	})

	it('should throw TrackNotFoundError for non-existent track', async () => {
		const fakeId = '00000000-0000-0000-0000-000000000000'
		await expect(useCase.execute(fakeId, Buffer.from('data'), 'audio/mpeg')).rejects.toThrow(
			`Track with id "${fakeId}" not found`,
		)
		expect(storagePortMock.upload).not.toHaveBeenCalled()
	})
})
