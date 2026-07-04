import { createDummyAlbum, createDummyAlbumPrismaORM } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createTestServer } from '#__tests__/testServer.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import CreateAlbumUseCase from '#application/useCases/album/CreateAlbumUseCase.js'
import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import AlbumController from '#infra/controllers/AlbumControler.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import { authMiddlewareMock } from '#infra/http/middlewares/__mocks__/authMiddlewareMock.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

let albumRepository: AlbumRepository
let userRepository: UserRepository
let artistRepository: ArtistRepository
let server: ExpressAdapter
let createAlbumUseCase: CreateAlbumUseCase

describe('AlbumController', () => {
	let dummyUsers: User[]
	let dummyArtists: Artist[]
	let dummyAlbuns: Album[]
	beforeEach(() => {
		server = createTestServer()
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
		userRepository = new UserRepositoryMemory(dummyUsers)
		artistRepository = new ArtistRepositoryMemory(dummyArtists)
		albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
		createAlbumUseCase = new CreateAlbumUseCase(albumRepository, artistRepository)
		new AlbumController(server, authMiddlewareMock, albumRepository, createAlbumUseCase)
		server.registerErrorHandler()
	})
	describe('GET /albums', () => {
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
		let dummyAlbum: Album
		beforeEach(() => {
			dummyAlbum = createDummyAlbum({
				name: 'Dummy Album',
				albumType: 'album',
				releaseDate: '2023',
				releasePrecision: 'year',
				totalTracks: 10,
				label: 'Dummy Label',
			})
			albumRepository.create(dummyAlbum)
		})
		it('should return 200 on success querying an album by id', async () => {
			const res = await request(server.app).get(`/albums/${dummyAlbum.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyAlbum.id,
				name: dummyAlbum.name,
				albumType: dummyAlbum.albumType,
				releaseDate: dummyAlbum.releaseDate,
				releasePrecision: dummyAlbum.releasePrecision,
				totalTracks: dummyAlbum.totalTracks,
				label: dummyAlbum.label,
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
		it('should return 400 if the request body is empty', async () => {
			const dummyAlbum = createDummyAlbum()
			albumRepository.create(dummyAlbum)
			const res = await request(server.app).patch(`/albums/${dummyAlbum.id}`).send({})
			expect(res.status).toBe(400)
			expect(res.body.message).toEqual('Invalid input')
		})
	})
})
