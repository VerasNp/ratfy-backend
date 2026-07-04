import { vi } from 'vitest'
import type { CachePort } from '../CachePort'

export const cachePortMock: CachePort = {
  clearPlaybackState: vi.fn(),
  connect: vi.fn(),
  del: vi.fn(),
  disconnect: vi.fn(),
  exists: vi.fn(),
  expire: vi.fn(),
  flushAll: vi.fn(),
  get: vi.fn(),
  getPlaybackState: vi.fn(),
  set: vi.fn(),
  setPlaybackState: vi.fn(),
}
