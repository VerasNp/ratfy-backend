import Redis, { type RedisOptions } from 'ioredis'

import type { CachePort, PlaybackState } from '#application/ports/CachePort.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import CacheError from '#application/errors/CacheError.js'

const PLAYBACK_KEY_PREFIX = 'playback:state:'
const PLAYBACK_TTL = 86_400

class RedisCacheAdapter implements CachePort {
  private client: Redis

  public constructor(
    private readonly redisUrl: string,
    private readonly loggerService: LoggerPort,
    connectTimeout = 10000,
  ) {
    const redisOptions: RedisOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      connectTimeout,
      retryStrategy(times) {
        return Math.min(times * 200, 30_000)
      },
    }

    if (this.redisUrl.startsWith('rediss://')) {
      redisOptions.tls = {}
    }

    this.client = new Redis(this.redisUrl, redisOptions)
  }

  public async clearPlaybackState(userId: string): Promise<void> {
    const key = `${PLAYBACK_KEY_PREFIX}${userId}`
    await this.del(key)
  }

  public async connect(): Promise<void> {
    await this.client.connect()
    this.loggerService.info('Connected to Redis')
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  public async disconnect(): Promise<void> {
    await this.client.quit()
  }

  public async flushAll(): Promise<void> {
    await this.client.flushdb()
  }

  public async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key)
    return result === 1
  }

  public async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds)
  }

  public async get<T>(key: string): Promise<null | T> {
    const raw = await this.client.get(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch (error) {
      throw new CacheError(`Failed to parse cached value for key "${key}"`, error)
    }
  }

  public async getPlaybackState(userId: string): Promise<null | PlaybackState> {
    const key = `${PLAYBACK_KEY_PREFIX}${userId}`
    return await this.get<PlaybackState>(key)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttlSeconds !== undefined) {
      await this.client.setex(key, ttlSeconds, serialized)
    } else {
      await this.client.set(key, serialized)
    }
  }

  public async setPlaybackState(userId: string, state: PlaybackState): Promise<void> {
    const key = `${PLAYBACK_KEY_PREFIX}${userId}`
    await this.set(key, state, PLAYBACK_TTL)
  }
}

export default RedisCacheAdapter
