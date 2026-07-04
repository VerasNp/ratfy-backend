import { createTestServer } from '#__tests__/testServer.js'
import { authMiddlewareMock, noAuthMiddlewareMock } from '#__tests__/mockMiddleware.js'
import { cachePortMock } from '#application/ports/__mocks__/CachePortMock.js'
import PlaybackController from '#infra/controllers/PlaybackController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

let server: ExpressAdapter

beforeEach(() => {
  vi.clearAllMocks()
  server = createTestServer()

  new PlaybackController(server, cachePortMock, authMiddlewareMock)
  server.registerErrorHandler()
})

describe('PlaybackController', () => {
  describe('PUT /playback/state', () => {
    it('should return 200 and set playback state', async () => {
      const body = { trackId: '550e8400-e29b-41d4-a716-446655440000', positionMs: 45000 }

      const res = await request(server.app).put('/playback/state').send(body)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        trackId: body.trackId,
        positionMs: body.positionMs,
      })
      expect(res.body.updatedAt).toBeDefined()
      expect(cachePortMock.setPlaybackState).toHaveBeenCalledWith('user-id', expect.objectContaining(body))
    })

    it('should return 400 for invalid body', async () => {
      const res = await request(server.app).put('/playback/state').send({ trackId: 'not-a-uuid' })

      expect(res.status).toBe(400)
    })

    it('should return 401 without auth', async () => {
      const noAuthServer = createTestServer()
      new PlaybackController(noAuthServer, cachePortMock, noAuthMiddlewareMock)
      noAuthServer.registerErrorHandler()

      const res = await request(noAuthServer.app)
        .put('/playback/state')
        .send({ trackId: '550e8400-e29b-41d4-a716-446655440000', positionMs: 0 })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /playback/state', () => {
    it('should return 200 and playback state', async () => {
      vi.mocked(cachePortMock.getPlaybackState).mockResolvedValue({
        trackId: '550e8400-e29b-41d4-a716-446655440000',
        positionMs: 45000,
        updatedAt: new Date().toISOString(),
      })

      const res = await request(server.app).get('/playback/state')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('trackId')
      expect(cachePortMock.getPlaybackState).toHaveBeenCalledWith('user-id')
    })

    it('should return null shape when no state exists', async () => {
      vi.mocked(cachePortMock.getPlaybackState).mockResolvedValue(null)

      const res = await request(server.app).get('/playback/state')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ trackId: null, positionMs: 0, updatedAt: null })
    })

    it('should return 401 without auth', async () => {
      const noAuthServer = createTestServer()
      new PlaybackController(noAuthServer, cachePortMock, noAuthMiddlewareMock)
      noAuthServer.registerErrorHandler()

      const res = await request(noAuthServer.app).get('/playback/state')

      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /playback/state', () => {
    it('should return 204 and clear playback state', async () => {
      const res = await request(server.app).delete('/playback/state')

      expect(res.status).toBe(204)
      expect(cachePortMock.clearPlaybackState).toHaveBeenCalledWith('user-id')
    })

    it('should return 401 without auth', async () => {
      const noAuthServer = createTestServer()
      new PlaybackController(noAuthServer, cachePortMock, noAuthMiddlewareMock)
      noAuthServer.registerErrorHandler()

      const res = await request(noAuthServer.app).delete('/playback/state')

      expect(res.status).toBe(401)
    })
  })
})
