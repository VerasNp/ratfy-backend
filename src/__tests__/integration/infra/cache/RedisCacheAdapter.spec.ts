import Redis from 'ioredis'

import CacheError from '#application/errors/CacheError.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import RedisCacheAdapter from '#infra/cache/RedisCacheAdapter.js'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'

let adapter: RedisCacheAdapter

describe('RedisCacheAdapter', () => {
  beforeEach(async () => {
    adapter = new RedisCacheAdapter(inject('testRedisUrl'), loggerPortMock)
    await adapter.connect()
    await adapter.flushAll()
  })

  afterAll(async () => {
    if (adapter) {
      await adapter.disconnect()
    }
  })

  it('should set and get a string value', async () => {
    await adapter.set('mykey', 'hello')
    const result = await adapter.get<string>('mykey')
    expect(result).toBe('hello')
  })

  it('should set and get a JSON object', async () => {
    const obj = { foo: 'bar', num: 42 }
    await adapter.set('mykey', obj)
    const result = await adapter.get<typeof obj>('mykey')
    expect(result).toEqual(obj)
  })

  it('should check if a key exists', async () => {
    await adapter.set('mykey', 'value')
    expect(await adapter.exists('mykey')).toBe(true)
    expect(await adapter.exists('other')).toBe(false)
  })

  it('should delete a key', async () => {
    await adapter.set('mykey', 'value')
    await adapter.del('mykey')
    expect(await adapter.exists('mykey')).toBe(false)
  })

  it('should expire a key after TTL seconds (set with expire)', async () => {
    await adapter.set('mykey', 'value')
    await adapter.expire('mykey', 1)

    expect(await adapter.get('mykey')).toBe('value')
    await new Promise((r) => setTimeout(r, 1100))
    expect(await adapter.get('mykey')).toBeNull()
  })

  it('should expire a key after TTL seconds (set with ttlSeconds)', async () => {
    await adapter.set('mykey', 'value', 1)

    expect(await adapter.get('mykey')).toBe('value')
    await new Promise((r) => setTimeout(r, 1100))
    expect(await adapter.get('mykey')).toBeNull()
  })

  it('should set and get playback state', async () => {
    const state = { trackId: 'track-123', positionMs: 45000, updatedAt: new Date().toISOString() }
    await adapter.setPlaybackState('user-1', state)

    const result = await adapter.getPlaybackState('user-1')
    expect(result).toEqual(state)
  })

  it('should clear playback state', async () => {
    const state = { trackId: 'track-123', positionMs: 45000, updatedAt: new Date().toISOString() }
    await adapter.setPlaybackState('user-1', state)
    await adapter.clearPlaybackState('user-1')

    const result = await adapter.getPlaybackState('user-1')
    expect(result).toBeNull()
  })

  it('should return null for non-existent keys', async () => {
    const result = await adapter.get('mykey')
    expect(result).toBeNull()
  })

  it('should throw CacheError for corrupted JSON', async () => {
    const raw = new Redis(inject('testRedisUrl'))
    await raw.set('corrupted', 'not-json')
    await raw.quit()

    await expect(adapter.get('corrupted')).rejects.toThrow(CacheError)
  })
})
