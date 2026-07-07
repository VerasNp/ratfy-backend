import { createTestServer } from '#__tests__/testServer.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import TrackController from '#infra/controllers/TrackController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import Track from '#domain/track/Track.js'
import type Album from '#domain/album/Album.js'
import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import CreateTrackUseCase from '#application/useCases/track/CreateTrackUseCase.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import GetTrackUseCase from '#application/useCases/track/GetTrackUseCase.js'
import UpdateTrackUseCase from '#application/useCases/track/UpdateTrackUseCase.js'
import DeleteTrackUseCase from '#application/useCases/track/DeleteTrackUseCase.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { favoriteRepositoryMock } from '#application/ports/__mocks__/FavoriteRepositoryMock.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'

describe('TrackController', () => {
	let dummyAlbuns: Album[] = []
	let dummyTracks: Track[] = []
	let dummyArtists: Artist[] = []
	let dummyUsers: User[] = []
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
				id: `album-${i}`,
				title: `Album ${i}`,
				year: 2020,
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
	})
	describe('GET /tracks', () => {
		let server: ExpressAdapter
		let trackRepository: TrackRepository
		beforeEach(() => {
			server = createTestServer()
			trackRepository = new TrackRepositoryMemory(dummyTracks)
			new TrackController(
				server,
				trackRepository,
				null as any,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success querying tracks with limit and page', async () => {
			const res = await request(server.app).get('/tracks?limit=15&page=1')
			expect(res.status).toBe(200)
			expect(res.body.data).toHaveLength(15)
		})
		it('should return 200 on success querying tracks with a search query', async () => {
			const res = await request(server.app).get('/tracks?limit=15&page=1&query=Track 1')
			expect(res.status).toBe(200)
			expect(res.body.data).toHaveLength(3)
		})
	})
	describe('POST /tracks', () => {
		let server: ExpressAdapter
		let trackRepository: TrackRepository
		let createTrackUseCase: CreateTrackUseCase
		let albumRepository: AlbumRepository
		let artistRepository: ArtistRepository
		beforeEach(() => {
			server = createTestServer()
			trackRepository = new TrackRepositoryMemory(dummyTracks)
			albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
			artistRepository = new ArtistRepositoryMemory(dummyArtists)
			createTrackUseCase = new CreateTrackUseCase(
				trackRepository,
				albumRepository,
				artistRepository,
				loggerPortMock,
			)
			new TrackController(
				server,
				trackRepository,
				createTrackUseCase,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it("should return 400 if the request body doesn't match the schema", async () => {
			const input = {
				title: 'New Track',
				durationMs: 300000,
				discNumber: 1,
				trackNumber: 1,
				explicit: false,
				isPublic: true,
			}
			const res = await request(server.app).post('/tracks').send(input)
			expect(res.status).toBe(400)
			expect(res.body).toMatchObject({
				message: 'Invalid input',
				errors: expect.arrayContaining([
					expect.objectContaining({
						message: 'Invalid input: expected string, received undefined',
						path: ['albumId'],
					}),
				]),
			})
		})

		it('should return 404 if the album does not exist', async () => {
			const input = {
				title: 'New Track',
				durationMs: 300000,
				discNumber: 1,
				trackNumber: 1,
				explicit: false,
				isPublic: true,
				albumId: 'non-exists-album-id',
				artistIds: [dummyArtists[0]!.id],
			}
			const res = await request(server.app).post('/tracks').send(input)
			expect(res.status).toBe(404)
			expect(res.body).toMatchObject({
				message: 'Album not found',
			})
		})

		it('should return 404 if one or more artists do not exist', async () => {
			const input = {
				title: 'New Track',
				durationMs: 300000,
				discNumber: 1,
				trackNumber: 1,
				explicit: false,
				isPublic: true,
				albumId: dummyAlbuns[0]!.id,
				artistIds: ['non-exists-artist-id'],
			}
			const res = await request(server.app).post('/tracks').send(input)
			expect(res.status).toBe(404)
			expect(res.body).toMatchObject({
				message: 'One or more artists not found',
			})
		})

		it('should return 201 if the request body matches the schema', async () => {
			const input = {
				title: 'New Track',
				durationMs: 300000,
				discNumber: 1,
				trackNumber: 1,
				explicit: false,
				isPublic: true,
				albumId: dummyAlbuns[0]!.id,
				artistIds: [dummyArtists[0]!.id],
			}
			const res = await request(server.app).post('/tracks').send(input)
			expect(res.status).toBe(201)
			expect(res.body.data).toMatchObject({
				title: input.title,
				durationMs: input.durationMs,
				discNumber: input.discNumber,
				trackNumber: input.trackNumber,
				explicit: input.explicit,
				isPublic: input.isPublic,
				album: {
					id: dummyAlbuns[0]!.id,
					name: dummyAlbuns[0]!.name,
				},
				artists: [
					{
						id: dummyArtists[0]!.id,
						name: dummyArtists[0]!.user!.name,
					},
				],
			})
		})
	})
	describe('GET /tracks/:trackId', () => {
		let server: ExpressAdapter
		let trackRepository: TrackRepository
		let getTrackUseCase: GetTrackUseCase
		beforeEach(() => {
			server = createTestServer()
			trackRepository = new TrackRepositoryMemory(dummyTracks)
			getTrackUseCase = new GetTrackUseCase(trackRepository, loggerPortMock)
			;(null as any,
				new TrackController(
					server,
					trackRepository,
					null as any,
					getTrackUseCase,
					null as any,
					null as any,
				))
			server.registerErrorHandler()
		})
		it('should return 404 if the track does not exist', async () => {
			const res = await request(server.app).get('/tracks/non-existent-track-id')
			expect(res.status).toBe(404)
			expect(res.body).toMatchObject({
				message: 'Track not found',
			})
		})
		it('should return 200 if the track exists', async () => {
			const trackToGet = dummyTracks[0]!
			const res = await request(server.app).get(`/tracks/${trackToGet.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toMatchObject({
				id: trackToGet.id,
				title: trackToGet.title,
				durationMs: trackToGet.durationMs,
				discNumber: trackToGet.discNumber,
				trackNumber: trackToGet.trackNumber,
				explicit: trackToGet.explicit,
				lyrics: trackToGet.lyrics,
				isPublic: trackToGet.isPublic,
				album: {
					id: trackToGet.album!.id,
					name: trackToGet.album!.name,
				},
				artists: [
					{
						id: trackToGet.artists[0]!.id,
						name: trackToGet.artists[0]!.user!.name,
					},
				],
			})
		})
	})
	describe('PATCH /tracks/:trackId', () => {
		let server: ExpressAdapter
		let trackRepository: TrackRepository
		let albumRepository: AlbumRepository
		let artistRepository: ArtistRepository
		let updateTrackUseCase: UpdateTrackUseCase
		beforeEach(() => {
			server = createTestServer()
			trackRepository = new TrackRepositoryMemory(dummyTracks)
			albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
			artistRepository = new ArtistRepositoryMemory(dummyArtists)
			updateTrackUseCase = new UpdateTrackUseCase(
				trackRepository,
				albumRepository,
				artistRepository,
				loggerPortMock,
			)
			new TrackController(
				server,
				trackRepository,
				null as any,
				null as any,
				updateTrackUseCase,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 404 if the track does not exist', async () => {
			const input = {
				title: 'Updated Track',
			}
			const res = await request(server.app).patch('/tracks/non-existent-track-id').send(input)
			expect(res.status).toBe(404)
			expect(res.body).toMatchObject({
				message: 'Track not found',
			})
		})
		it('should return 400 if the request body does not match the schema', async () => {
			const input = {
				title: 123,
			}
			const res = await request(server.app).patch(`/tracks/${dummyTracks[0]!.id}`).send(input)
			expect(res.status).toBe(400)
		})
		it('should return 404 if the album does not exist', async () => {
			const input = {
				albumId: 'non-existent-album-id',
			}
			const res = await request(server.app).patch(`/tracks/${dummyTracks[0]!.id}`).send(input)
			expect(res.status).toBe(404)
			expect(res.body).toMatchObject({
				message: 'Album not found',
			})
		})
		it('should return 404 if one or more artists do not exist', async () => {
			const input = {
				albumId: dummyAlbuns[0]!.id,
				artistIds: ['non-existent-artist-id'],
			}
			const res = await request(server.app).patch(`/tracks/${dummyTracks[0]!.id}`).send(input)
			expect(res.status).toBe(404)
			expect(res.body).toMatchObject({
				message: 'One or more artists not found',
			})
		})
		it('should return 200 if the track is updated successfully', async () => {
			const input = {
				title: 'Updated Track',
				durationMs: 250000,
				discNumber: 1,
				trackNumber: 2,
				explicit: false,
				isPublic: true,
				albumId: dummyAlbuns[0]!.id,
				artistIds: [dummyArtists[0]!.id],
			}
			const res = await request(server.app).patch(`/tracks/${dummyTracks[0]!.id}`).send(input)
			expect(res.status).toBe(200)
			expect(res.body.data).toMatchObject({
				id: dummyTracks[0]!.id,
				title: input.title,
				durationMs: input.durationMs,
				discNumber: input.discNumber,
				trackNumber: input.trackNumber,
				explicit: input.explicit,
				isPublic: input.isPublic,
				album: {
					id: dummyAlbuns[0]!.id,
					name: dummyAlbuns[0]!.name,
				},
				artists: [
					{
						id: dummyArtists[0]!.id,
						name: dummyArtists[0]!.user!.name,
					},
				],
			})
		})
	})
	describe('DELETE /tracks/:trackId', () => {
		let server: ExpressAdapter
		let trackRepository: TrackRepository
		let deleteTrackUseCase: DeleteTrackUseCase
		beforeEach(() => {
			server = createTestServer()
			trackRepository = new TrackRepositoryMemory(dummyTracks)
			deleteTrackUseCase = new DeleteTrackUseCase(
				trackRepository,
				favoriteRepositoryMock,
				unitOfWorkMock,
				loggerPortMock,
			)
			new TrackController(
				server,
				trackRepository,
				null as any,
				null as any,
				null as any,
				deleteTrackUseCase,
			)
			server.registerErrorHandler()
		})
		it('should return 404 if the track does not exist', async () => {
			const res = await request(server.app).delete('/tracks/non-existent-track-id')
			expect(res.status).toBe(404)
			expect(res.body).toMatchObject({
				message: 'Track not found',
			})
		})
		it('should return 200 if the track is deleted successfully', async () => {
			const res = await request(server.app).delete(`/tracks/${dummyTracks[0]!.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toMatchObject({
				id: dummyTracks[0]!.id,
				title: dummyTracks[0]!.title,
				durationMs: dummyTracks[0]!.durationMs,
				discNumber: dummyTracks[0]!.discNumber,
				trackNumber: dummyTracks[0]!.trackNumber,
				explicit: dummyTracks[0]!.explicit,
				isPublic: dummyTracks[0]!.isPublic,
				album: {
					id: dummyTracks[0]!.album!.id,
					name: dummyTracks[0]!.album!.name,
				},
				artists: [
					{
						id: dummyTracks[0]!.artists[0]!.id,
						name: dummyTracks[0]!.artists[0]!.user!.name,
					},
				],
			})
		})
	})
})
