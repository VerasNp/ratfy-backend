import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createTestServer } from '#__tests__/testServer.js'
import { CreatePlaylistUseCase } from '#application/useCases/playlist/CreatePlaylist.js'
import { UpdatePlaylistUseCase } from '#application/useCases/playlist/UpdatePlaylist.js'
import { DeletePlaylistUseCase } from '#application/useCases/playlist/DeletePlaylist.js'
import { AddTrackToPlaylistUseCase } from '#application/useCases/playlist/AddTrackToPlaylist.js'
import { RemoveTrackFromPlaylistUseCase } from '#application/useCases/playlist/RemoveTrackFromPlaylist.js'
import { favoriteRepositoryMock } from '#application/ports/__mocks__/FavoriteRepositoryMock.js'
import type Playlist from '#domain/playlist/Playlist.js'
import type User from '#domain/user/User.js'
import PlaylistController from '#infra/controllers/PlaylistController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import { authMiddlewareMock } from '#infra/http/middlewares/__mocks__/authMiddlewareMock.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { storagePortMock } from '#application/ports/__mocks__/StoragePortMock.js'

const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000000'

describe('PlaylistController', () => {
	let dummyUsers: User[]
	let dummyPlaylists: Playlist[]
	beforeEach(() => {
		dummyUsers = []
		dummyPlaylists = []
		for (let i = 1; i <= 5; i++) {
			const dummyUser = createDummyUser({
				name: `User ${i}`,
				email: `foo${i}@bar.com`,
			})
			dummyUsers.push(dummyUser)
			const dummyPlaylist = createDummyPlaylist(dummyUser, { name: `Playlist ${i}` })
			dummyPlaylists.push(dummyPlaylist)
		}
	})
	describe('GET /playlists', () => {
		let playlistRepository: PlaylistRepositoryMemory
		let server: ExpressAdapter
		beforeEach(() => {
			server = createTestServer()
			playlistRepository = new PlaylistRepositoryMemory(dummyPlaylists)
			new PlaylistController(
				server,
				playlistRepository,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success querying playlists with limit and page', async () => {
			const res = await request(server.app).get('/playlists?limit=3&page=1')
			expect(res.status).toBe(200)
			expect(res.body.data).toHaveLength(3)
		})
	})
	describe('GET /playlists/:id', () => {
		let playlistRepository: PlaylistRepositoryMemory
		let server: ExpressAdapter
		beforeEach(() => {
			server = createTestServer()
			playlistRepository = new PlaylistRepositoryMemory(dummyPlaylists)
			new PlaylistController(
				server,
				playlistRepository,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success querying a playlist by id', async () => {
			const res = await request(server.app).get(`/playlists/${dummyPlaylists[0]!.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyPlaylists[0]!.id,
				name: dummyPlaylists[0]!.name,
				isPublic: dummyPlaylists[0]!.isPublic,
				ownerId: dummyPlaylists[0]!.ownerId,
				createdAt: dummyPlaylists[0]!.createdAt.toISOString(),
				updatedAt: dummyPlaylists[0]!.updatedAt.toISOString(),
			})
		})
		it('should return 404 when playlist is not found', async () => {
			const res = await request(server.app).get(`/playlists/${NON_EXISTENT_UUID}`)
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'Playlist not found',
			})
		})
	})
	describe('GET /playlists/owner/:ownerId', () => {
		let playlistRepository: PlaylistRepositoryMemory
		let server: ExpressAdapter
		beforeEach(() => {
			server = createTestServer()
			playlistRepository = new PlaylistRepositoryMemory(dummyPlaylists)
			new PlaylistController(
				server,
				playlistRepository,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success querying playlists by owner', async () => {
			const res = await request(server.app)
				.get(`/playlists/owner/${dummyUsers[0]!.id}`)
				.query({ limit: 10, page: 1 })
			expect(res.status).toBe(200)
			expect(res.body.data).toHaveLength(1)
			expect(res.body.data[0]!.ownerId).toBe(dummyUsers[0]!.id)
		})
	})
	describe('POST /playlists', () => {
		let playlistRepository: PlaylistRepositoryMemory
		let server: ExpressAdapter
		let createPlaylistUseCase: CreatePlaylistUseCase
		beforeEach(() => {
			server = createTestServer()
			playlistRepository = new PlaylistRepositoryMemory()
			createPlaylistUseCase = new CreatePlaylistUseCase(playlistRepository)
			new PlaylistController(
				server,
				playlistRepository,
				authMiddlewareMock,
				createPlaylistUseCase,
				null as any,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 201 on success creating a playlist', async () => {
			const input = {
				name: 'New Playlist',
				ownerId: dummyUsers[0]!.id,
			}
			const res = await request(server.app).post('/playlists').send(input)
			expect(res.status).toBe(201)
			expect(res.body.data).toEqual({
				id: expect.any(String),
				name: input.name,
				isPublic: true,
				ownerId: input.ownerId,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			})
		})
		it('should return 400 on invalid input', async () => {
			const input = { name: '', ownerId: 'not-a-uuid' }
			const res = await request(server.app).post('/playlists').send(input)
			expect(res.status).toBe(400)
			expect(res.body.message).toBe('Invalid input')
			expect(res.body.errors).toBeDefined()
		})
	})
	describe('PATCH /playlists/:id', () => {
		let playlistRepository: PlaylistRepositoryMemory
		let server: ExpressAdapter
		let updatePlaylistUseCase: UpdatePlaylistUseCase
		beforeEach(() => {
			server = createTestServer()
			playlistRepository = new PlaylistRepositoryMemory(dummyPlaylists)
			updatePlaylistUseCase = new UpdatePlaylistUseCase(playlistRepository)
			new PlaylistController(
				server,
				playlistRepository,
				authMiddlewareMock,
				null as any,
				updatePlaylistUseCase,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success updating a playlist', async () => {
			const input = { name: 'Updated Name' }
			const res = await request(server.app)
				.patch(`/playlists/${dummyPlaylists[0]!.id}`)
				.send(input)
			expect(res.status).toBe(200)
		})
		it('should return 404 when playlist is not found', async () => {
			const input = { name: 'Nope' }
			const res = await request(server.app)
				.patch(`/playlists/${NON_EXISTENT_UUID}`)
				.send(input)
			expect(res.status).toBe(404)
		})
		it('should return 400 on invalid input', async () => {
			const input = { name: '' }
			const res = await request(server.app)
				.patch(`/playlists/${dummyPlaylists[0]!.id}`)
				.send(input)
			expect(res.status).toBe(400)
			expect(res.body.message).toBe('Invalid input')
		})
	})
	describe('DELETE /playlists/:id', () => {
		let playlistRepository: PlaylistRepositoryMemory
		let server: ExpressAdapter
		let deletePlaylistUseCase: DeletePlaylistUseCase
		beforeEach(() => {
			server = createTestServer()
			playlistRepository = new PlaylistRepositoryMemory(dummyPlaylists)
			deletePlaylistUseCase = new DeletePlaylistUseCase(playlistRepository, favoriteRepositoryMock, storagePortMock, 'images')
			new PlaylistController(
				server,
				playlistRepository,
				authMiddlewareMock,
				null as any,
				null as any,
				deletePlaylistUseCase,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 204 on success deleting a playlist', async () => {
			const res = await request(server.app).delete(`/playlists/${dummyPlaylists[0]!.id}`)
			expect(res.status).toBe(204)
		})
		it('should return 404 when playlist is not found', async () => {
			const res = await request(server.app).delete(`/playlists/${NON_EXISTENT_UUID}`)
			expect(res.status).toBe(404)
		})
	})
	describe('POST /playlists/:playlistId/tracks', () => {
		let playlistRepository: PlaylistRepositoryMemory
		let server: ExpressAdapter
		let addTrackToPlaylistUseCase: AddTrackToPlaylistUseCase
		beforeEach(() => {
			server = createTestServer()
			playlistRepository = new PlaylistRepositoryMemory(dummyPlaylists)
			addTrackToPlaylistUseCase = new AddTrackToPlaylistUseCase(playlistRepository)
			new PlaylistController(
				server,
				playlistRepository,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				addTrackToPlaylistUseCase,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 204 on success adding a track', async () => {
			const res = await request(server.app)
				.post(`/playlists/${dummyPlaylists[0]!.id}/tracks`)
				.send({ trackId: crypto.randomUUID() })
			expect(res.status).toBe(204)
		})
		it('should return 404 when playlist is not found', async () => {
			const res = await request(server.app)
				.post(`/playlists/${NON_EXISTENT_UUID}/tracks`)
				.send({ trackId: crypto.randomUUID() })
			expect(res.status).toBe(404)
		})
		it('should return 400 on invalid input', async () => {
			const res = await request(server.app)
				.post(`/playlists/${dummyPlaylists[0]!.id}/tracks`)
				.send({})
			expect(res.status).toBe(400)
			expect(res.body.message).toBe('Invalid input')
		})
	})
	describe('DELETE /playlists/:playlistId/tracks/:trackId', () => {
		let playlistRepository: PlaylistRepositoryMemory
		let server: ExpressAdapter
		let removeTrackFromPlaylistUseCase: RemoveTrackFromPlaylistUseCase
		beforeEach(() => {
			server = createTestServer()
			playlistRepository = new PlaylistRepositoryMemory(dummyPlaylists)
			removeTrackFromPlaylistUseCase = new RemoveTrackFromPlaylistUseCase(playlistRepository)
			new PlaylistController(
				server,
				playlistRepository,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				null as any,
				removeTrackFromPlaylistUseCase,
			)
			server.registerErrorHandler()
		})
		it('should return 204 on success removing a track', async () => {
			const res = await request(server.app)
				.delete(`/playlists/${dummyPlaylists[0]!.id}/tracks/${crypto.randomUUID()}`)
			expect(res.status).toBe(204)
		})
		it('should return 404 when playlist is not found', async () => {
			const res = await request(server.app)
				.delete(`/playlists/${NON_EXISTENT_UUID}/tracks/${crypto.randomUUID()}`)
			expect(res.status).toBe(404)
		})
		it('should return 400 on invalid input', async () => {
			const res = await request(server.app)
				.delete(`/playlists/${dummyPlaylists[0]!.id}/tracks/not-a-uuid`)
			expect(res.status).toBe(400)
			expect(res.body.message).toBe('Invalid input')
		})
	})
})
