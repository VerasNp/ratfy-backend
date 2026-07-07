import { createTestServer } from '#__tests__/testServer.js'
import { storagePortMock } from '#application/ports/__mocks__/StoragePortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { UploadTrackAudioUseCase } from '#application/useCases/upload/UploadTrackAudioUseCase.js'
import { UploadAlbumCoverUseCase } from '#application/useCases/upload/UploadAlbumCoverUseCase.js'
import { UploadArtistProfileImageUseCase } from '#application/useCases/upload/UploadArtistProfileImageUseCase.js'
import { UploadPlaylistCoverUseCase } from '#application/useCases/upload/UploadPlaylistCoverUseCase.js'
import Album from '#domain/album/Album.js'
import Artist from '#domain/artist/Artist.js'
import Playlist from '#domain/playlist/Playlist.js'
import Track from '#domain/track/Track.js'
import { authMiddlewareMock, noAuthMiddlewareMock } from '#__tests__/mockMiddleware.js'
import UploadController from '#infra/controllers/UploadController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { validAudioBuffer, validImageBuffer } from '#__tests__/testHelpers.js'
import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import type User from '#domain/user/User.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'

let server: ExpressAdapter
let trackRepo: TrackRepositoryMemory
let albumRepo: AlbumRepositoryMemory
let artistRepo: ArtistRepositoryMemory
let playlistRepo: PlaylistRepositoryMemory
let dummyTrack: Track
let dummyAlbum: Album
let dummyArtist: Artist
let dummyPlaylist: Playlist
let dummyUser: User

function setupAuthServer() {
	const srv = createTestServer()

	dummyUser = createDummyUser({ name: 'Test User', email: 'foo@bar.com' })
	dummyArtist = createDummyArtist(dummyUser, { bio: 'Test bio' })
	dummyAlbum = createDummyAlbum({
		name: 'Test Album',
		albumType: 'album',
		releaseDate: '2024-01-01',
		releasePrecision: 'day',
		totalTracks: 10,
		label: 'Test Label',
		isPublic: true,
		artists: [dummyArtist],
	})
	dummyTrack = createDummyTrack({
		durationMs: 200000,
		explicit: false,
		title: 'Test Track',
		trackNumber: 1,
		album: dummyAlbum,
		artists: [dummyArtist],
	})

	trackRepo = new TrackRepositoryMemory([dummyTrack])
	albumRepo = new AlbumRepositoryMemory([dummyAlbum])
	artistRepo = new ArtistRepositoryMemory([dummyArtist])
	playlistRepo = new PlaylistRepositoryMemory()

	dummyPlaylist = Playlist.create({ name: 'Test Playlist', ownerId: 'user-id' })
	playlistRepo.create(dummyPlaylist)

	new UploadController(
		srv,
		authMiddlewareMock,
		new UploadTrackAudioUseCase(trackRepo, storagePortMock, loggerPortMock, 'audio'),
		new UploadAlbumCoverUseCase(albumRepo, storagePortMock, loggerPortMock, 'images'),
		new UploadArtistProfileImageUseCase(artistRepo, storagePortMock, loggerPortMock, 'images'),
		new UploadPlaylistCoverUseCase(playlistRepo, storagePortMock, loggerPortMock, 'images'),
		1000,
	)

	srv.registerErrorHandler()
	return srv
}

describe('UploadController', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		server = setupAuthServer()
	})

	describe('POST /tracks/:id/audio', () => {
		it('should return 200 on successful upload', async () => {
			vi.mocked(storagePortMock.upload).mockResolvedValue('http://storage/audio/file.mpeg')
			const fileData = validAudioBuffer

			const res = await request(server.app)
				.post(`/tracks/${dummyTrack.id}/audio`)
				.attach('file', fileData, 'test.mp3')

			expect(res.status).toBe(200)
			expect(res.body.data).toHaveProperty('audioFileKey')
			expect(res.body.data).toHaveProperty('audioFileSize', fileData.length)
			expect(res.body.data).toHaveProperty('audioContentType', 'audio/mpeg')
		})

		it('should return 401 without auth', async () => {
			const noAuthServer = createTestServer()
			const mockUseCase = { execute: vi.fn() }
			new UploadController(
				noAuthServer,
				noAuthMiddlewareMock,
				mockUseCase as any,
				mockUseCase as any,
				mockUseCase as any,
				mockUseCase as any,
				1000,
			)
			noAuthServer.registerErrorHandler()

			const res = await request(noAuthServer.app)
				.post(`/tracks/${dummyTrack.id}/audio`)
				.attach('file', Buffer.from('data'), 'test.mp3')

			expect(res.status).toBe(401)
		})

		it('should return 404 for non-existent track', async () => {
			const res = await request(server.app)
				.post('/tracks/00000000-0000-0000-0000-000000000000/audio')
				.attach('file', validAudioBuffer, 'test.mp3')

			expect(res.status).toBe(404)
		})
	})

	describe('POST /albums/:id/cover', () => {
		it('should return 200 on successful upload', async () => {
			vi.mocked(storagePortMock.upload).mockResolvedValue('http://storage/images/cover.jpeg')
			const fileData = validImageBuffer

			const res = await request(server.app)
				.post(`/albums/${dummyAlbum.id}/cover`)
				.attach('file', fileData, 'cover.jpg')

			expect(res.status).toBe(200)
			expect(res.body.data).toHaveProperty('coverImageKey')
			expect(res.body.data).toHaveProperty('coverImageSize', fileData.length)
		})

		it('should return 404 for non-existent album', async () => {
			const res = await request(server.app)
				.post('/albums/00000000-0000-0000-0000-000000000000/cover')
				.attach('file', validImageBuffer, 'cover.jpg')

			expect(res.status).toBe(404)
		})
	})

	describe('POST /artists/:id/profile-image', () => {
		it('should return 200 on successful upload', async () => {
			vi.mocked(storagePortMock.upload).mockResolvedValue(
				'http://storage/images/profile.jpeg',
			)
			const fileData = validImageBuffer

			const res = await request(server.app)
				.post(`/artists/${dummyArtist.id}/profile-image`)
				.attach('file', fileData, 'profile.jpg')

			expect(res.status).toBe(200)
			expect(res.body.data).toHaveProperty('profileImageKey')
			expect(res.body.data).toHaveProperty('profileImageSize', fileData.length)
		})

		it('should return 404 for non-existent artist', async () => {
			const res = await request(server.app)
				.post('/artists/00000000-0000-0000-0000-000000000000/profile-image')
				.attach('file', validImageBuffer, 'profile.jpg')

			expect(res.status).toBe(404)
		})
	})

	describe('POST /playlists/:id/cover', () => {
		it('should return 200 on successful upload', async () => {
			vi.mocked(storagePortMock.upload).mockResolvedValue('http://storage/images/cover.jpeg')
			const fileData = validImageBuffer

			const res = await request(server.app)
				.post(`/playlists/${dummyPlaylist.id}/cover`)
				.attach('file', fileData, 'cover.jpg')

			expect(res.status).toBe(200)
			expect(res.body.data).toHaveProperty('coverImageKey')
			expect(res.body.data).toHaveProperty('coverImageSize', fileData.length)
		})

		it('should return 404 for non-existent playlist', async () => {
			const res = await request(server.app)
				.post('/playlists/00000000-0000-0000-0000-000000000000/cover')
				.attach('file', validImageBuffer, 'cover.jpg')

			expect(res.status).toBe(404)
		})
	})
})
