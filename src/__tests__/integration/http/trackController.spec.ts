import { createTestServer } from '#__tests__/testServer.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import TrackController from '#infra/controllers/TrackController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import Track from '#domain/track/Track.js'
import Album from '#domain/album/Album.js'

let server: ExpressAdapter
let trackRepository: TrackRepository
let dummyTracks: Track[]
let dummyTrack: Track

describe('TrackController', () => {
	beforeEach(() => {
		server = createTestServer()
		dummyTracks = []

		for (let i = 1; i <= 30; i++) {
			const track = Track.create({
				title: `Track ${i}`,
				durationMs: 300000,
				discNumber: 1,
				trackNumber: i,
				explicit: false,
				isPublic: true,
				album: {
					id: `album-${i}`,
				}
			})
			dummyTracks.push(track)
		}
		dummyTrack = dummyTracks[0]!
		trackRepository = new TrackRepositoryMemory(dummyTracks)
		new TrackController(server, trackRepository)
	})
	describe.only('GET /tracks', () => {
		it('should return 200 on success querying tracks with limit and page', async () => {
			const res = await request(server.app).get('/tracks?limit=15&page=1')
			expect(res.status).toBe(200)
			expect(res.body).toHaveLength(15)
			expect(res.body[0]).toStrictEqual({
				id: dummyTrack.id,
				title: dummyTrack.title,
				durationMs: dummyTrack.durationMs.value,
				discNumber: dummyTrack.discNumber.value,
				trackNumber: dummyTrack.trackNumber.value,
				explicit: dummyTrack.explicit,
				lyrics: dummyTrack.lyrics,
				isPublic: dummyTrack.isPublic,
				createdAt: dummyTrack.createdAt.toISOString(),
				updatedAt: dummyTrack.updatedAt.toISOString(),
				deletedAt: dummyTrack.deletedAt,
				album: dummyTrack.album,
				artists: dummyTrack.artists,
			})
		})
		it("should return 200 on success querying tracks with a search query", async () => {
			const res = await request(server.app).get('/tracks?limit=15&page=1&query=Track 1')
			expect(res.status).toBe(200)
			expect(res.body).toHaveLength(7)
		})
	})
})
