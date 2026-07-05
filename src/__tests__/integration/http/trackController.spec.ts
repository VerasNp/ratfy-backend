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

describe('TrackController', () => {
	let dummyAlbuns: Album[] = []
	let dummyTracks: Track[] = []
	beforeEach(() => {
		for (let i = 1; i <= 5; i++) {
			let dummyAlbum = createDummyAlbum({
				id: `album-${i}`,
				title: `Album ${i}`,
				year: 2020,
			})
			dummyAlbuns.push(dummyAlbum)
			for (let j = 1; j <= 6; j++) {
				let dummyTrack = createDummyTrack({
					album: dummyAlbum,
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
			new TrackController(server, trackRepository)
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
})
