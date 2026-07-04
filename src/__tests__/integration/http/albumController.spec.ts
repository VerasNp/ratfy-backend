import { createDummyAlbum, createDummyAlbumPrismaORM } from '#__tests__/factories/AlbumFactory.js'
import { createTestServer } from '#__tests__/testServer.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import type Album from '#domain/album/Album.js'
import AlbumController from '#infra/controllers/AlbumControler.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import { authMiddlewareMock } from '#infra/http/middlewares/__mocks__/authMiddlewareMock.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

let albumRepository: AlbumRepository
let server: ExpressAdapter

describe('AlbumController', () => {
	let dummyAlbuns: Album[]
	beforeEach(() => {
		server = createTestServer()
		dummyAlbuns = []
		for (let i = 1; i <= 30; i++) {
			const dummyAlbum = createDummyAlbum()
			dummyAlbuns.push(dummyAlbum)
		}
		albumRepository = new AlbumRepositoryMemory(dummyAlbuns)
		new AlbumController(server, authMiddlewareMock, albumRepository)
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
		beforeAll(() => {
			dummyAlbum = createDummyAlbum({
				name: 'Dummy Album',
				albumType: 'Album',
				releaseDate: (new Date()).toISOString().split('T')[0],
				releasePrecision: 'Year',
				totalTracks: 10,
				label: 'Dummy Label',
			})
			albumRepository.create(dummyAlbum)
		})
		it('should return 200 on success querying an album by id', async () => {
			const res = await request(server.app).get(`/albums/${dummyAlbum.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toBe({
				id: dummyAlbum.id,
				name: dummyAlbum.name,
				albumType: dummyAlbum.albumType,
				releaseDate: dummyAlbum.releaseDate,
				releasePrecision: dummyAlbum.releasePrecision,
				totalTracks: dummyAlbum.totalTracks,
				label: dummyAlbum.label,
			})
		})
	})
})
