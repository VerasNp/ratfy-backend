import { createDummyAlbum, createDummyAlbumPrismaORM } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createTestServer } from '#__tests__/testServer.js'
import { favoriteRepositoryMock } from '#application/ports/__mocks__/FavoriteRepositoryMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import CreateAlbumUseCase from '#application/useCases/album/CreateAlbumUseCase.js'
import DeleteAlbumUseCase from '#application/useCases/album/DeleteAlbumUseCase.js'
import UpdateAlbumUseCase from '#application/useCases/album/UpdateAlbumUseCase.js'
import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import AlbumController from '#infra/controllers/AlbumController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import { authMiddlewareMock } from '#infra/http/middlewares/__mocks__/authMiddlewareMock.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('AlbumController', () => {
	let dummyUsers: User[]
	let dummyArtists: Artist[]
	let dummyAlbuns: Album[]
	beforeEach(() => {
		dummyUsers = []
		dummyArtists = []
		for (let i = 1; i <= 5; i++) {
			let dummyUser = createDummyUser({
				name: `User ${i}`,
				email: `foo${i}@bar.com`,
			})
			dummyUsers.push(dummyUser)
			let dummyArtist = createDummyArtist(dummyUser)
			dummyArtists.push(dummyArtist)
		}
		dummyAlbuns = []
		for (let i = 1; i <= 30; i++) {
			const dummyAlbum = createDummyAlbum()
			dummyAlbuns.push(dummyAlbum)
		}
	})
	describe('GET /albums', () => {
		let albumRepository: AlbumRepository
		let server: ExpressAdapter
		beforeEach(() => {
			server = createTestServer()
			albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
			new AlbumController(
				server,
				authMiddlewareMock,
				albumRepository,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success querying albums with limit and page', async () => {
			const res = await request(server.app).get('/albums').query({ limit: 10, page: 1 })
			expect(res.status).toBe(200)
			expect(res.body.data).toHaveLength(10)
		})
		it('should return 400 on invalid query params', async () => {
			const res = await request(server.app).get('/albums').query({ limit: 100, page: 0 })
			expect(res.status).toBe(400)
		})
	})
	describe('GET /albums/:albumId', () => {
		let albumRepository: AlbumRepository
		let server: ExpressAdapter
		beforeEach(() => {
			server = createTestServer()
			albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
			new AlbumController(
				server,
				authMiddlewareMock,
				albumRepository,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success querying an album by id', async () => {
			const res = await request(server.app).get(`/albums/${dummyAlbuns[0]!.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyAlbuns[0]!.id,
				name: dummyAlbuns[0]!.name,
				albumType: dummyAlbuns[0]!.albumType,
				releaseDate: dummyAlbuns[0]!.releaseDate,
				releasePrecision: dummyAlbuns[0]!.releasePrecision,
				totalTracks: dummyAlbuns[0]!.totalTracks,
				label: dummyAlbuns[0]!.label,
			})
		})

		it('should return 404 if album not found', async () => {
			const res = await request(server.app).get(`/albums/non-existent-id`)
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'Album not found',
			})
		})
	})
	describe('POST /albums', () => {
		let albumRepository: AlbumRepository
		let userRepository: UserRepository
		let artistRepository: ArtistRepository
		let server: ExpressAdapter
		let createAlbumUseCase: CreateAlbumUseCase
		beforeEach(() => {
			server = createTestServer()
			userRepository = new UserRepositoryMemory(dummyUsers)
			artistRepository = new ArtistRepositoryMemory(dummyArtists)
			albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
			createAlbumUseCase = new CreateAlbumUseCase(albumRepository, artistRepository)
			new AlbumController(
				server,
				authMiddlewareMock,
				albumRepository,
				createAlbumUseCase,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it("should return 400 if the request body doesn't match the schema", async () => {
			const input = {
				name: 'Test Album',
				albumType: 'album',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 10,
				label: 'Test Label',
				isPublic: true,
				artistIds: [],
			}
			const res = await request(server.app).post('/albums').send(input)
			expect(res.status).toBe(400)
			expect(res.body.message).toEqual('Invalid input')
			expect(res.body.errors).toBeDefined()
		})

		it('should return 200 on success creating an album', async () => {
			const dummyUser = createDummyUser()
			userRepository.create(dummyUser)
			const dummyArtist = createDummyArtist(dummyUser)
			artistRepository.create(dummyArtist)
			const input = {
				name: 'Test Album',
				albumType: 'album',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 10,
				label: 'Test Label',
				isPublic: true,
				artistIds: [dummyArtist.id],
			}
			const res = await request(server.app).post('/albums').send(input)
			expect(res.status).toBe(200)
			expect(res.body.data).toMatchObject({
				id: expect.any(String),
				name: input.name,
				albumType: input.albumType,
				releaseDate: input.releaseDate,
				releasePrecision: input.releasePrecision,
				totalTracks: input.totalTracks,
				label: input.label,
				isPublic: input.isPublic,
				artistCredits: [
					{
						id: dummyArtist.id,
						name: dummyUser.name,
					},
				],
			})
		})

		it('should return 404 if one or more artists are not found', async () => {
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
			const res = await request(server.app).post('/albums').send(input)
			expect(res.status).toBe(404)
			expect(res.body.message).toEqual('One or more artists not found')
		})
	})

	describe('PATCH /albums/:albumId', () => {
		let albumRepository: AlbumRepository
		let artistRepository: ArtistRepository
		let server: ExpressAdapter
		let updateAlbumUseCase: UpdateAlbumUseCase
		beforeEach(() => {
			server = createTestServer()
			artistRepository = new ArtistRepositoryMemory(dummyArtists)
			albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
			updateAlbumUseCase = new UpdateAlbumUseCase(albumRepository, artistRepository, loggerPortMock)
			new AlbumController(
				server,
				authMiddlewareMock,
				null as any,
				null as any,
				updateAlbumUseCase,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 400 if the request body is empty', async () => {
			const dummyAlbum = createDummyAlbum()
			albumRepository.create(dummyAlbum)
			const res = await request(server.app).patch(`/albums/${dummyAlbum.id}`).send({})
			expect(res.status).toBe(400)
			expect(res.body.message).toEqual('Invalid input')
		})
		it('should return 404 if the album does not exist', async () => {
			const input = {
				name: 'Updated Album Name',
				albumType: 'Updated Album Type',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 10,
				label: 'Updated Label',
				isPublic: true,
				artistIds: [dummyArtists[0]!.id, dummyArtists[1]!.id],
			}
			const res = await request(server.app).patch(`/albums/non-existent-album-id`).send(input)
			expect(res.status).toBe(404)
			expect(res.body.message).toEqual('Album not found')
		})
		it("should return 200 on success updating an album's data", async () => {
			const dummyArtist = createDummyArtist(dummyUsers[0]!)
			artistRepository.create(dummyArtist)
			const dummyAlbum = createDummyAlbum()
			albumRepository.create(dummyAlbum)
			const input = {
				name: 'Updated Album Name',
				albumType: 'ep',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 4,
				label: 'Updated Label',
				isPublic: true,
				artistIds: [dummyArtist.id],
			}
			const res = await request(server.app).patch(`/albums/${dummyAlbum.id}`).send(input)
			expect(res.status).toBe(200)
			expect(res.body.data).toMatchObject({
				id: dummyAlbum.id,
				name: input.name,
				albumType: input.albumType,
				releaseDate: input.releaseDate,
				releasePrecision: input.releasePrecision,
				totalTracks: input.totalTracks,
				label: input.label,
				isPublic: input.isPublic,
				artistCredits: [
					{
						id: dummyArtist.id,
						name: dummyUsers[0]!.name,
					},
				],
			})
		})
	})
	describe('DELETE /albums/:albumId', () => {
		let albumRepository: AlbumRepository
		let server: ExpressAdapter
		let deleteAlbumUseCase: DeleteAlbumUseCase
		beforeEach(() => {
			server = createTestServer()
			albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
			deleteAlbumUseCase = new DeleteAlbumUseCase(
				albumRepository,
				favoriteRepositoryMock,
				loggerPortMock,
				unitOfWorkMock,
			)
			new AlbumController(
				server,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				deleteAlbumUseCase,
			)
			server.registerErrorHandler()
		})
		it('should return 404 if the album does not exist', async () => {
			const res = await request(server.app).delete(`/albums/non-existent-album-id`)
			expect(res.status).toBe(404)
			expect(res.body.message).toEqual('Album not found')
		})

		it('should return 200 on success deleting an album', async () => {
			const dummyAlbum = createDummyAlbum()
			albumRepository.create(dummyAlbum)
			const res = await request(server.app).delete(`/albums/${dummyAlbum.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyAlbum.id,
				name: dummyAlbum.name,
				albumType: dummyAlbum.albumType,
				releaseDate: dummyAlbum.releaseDate,
				releasePrecision: dummyAlbum.releasePrecision,
				totalTracks: dummyAlbum.totalTracks,
				label: dummyAlbum.label,
				isPublic: dummyAlbum.isPublic,
				artistCredits: dummyAlbum.artistCredits,
			})
		})
	})
})
