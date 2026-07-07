export interface CachePort {
  clearPlaybackState(userId: string): Promise<void>
  connect(): Promise<void>
  del(key: string): Promise<void>
  disconnect(): Promise<void>
  exists(key: string): Promise<boolean>
  expire(key: string, ttlSeconds: number): Promise<void>
  flushAll(): Promise<void>
  get<T>(key: string): Promise<null | T>
  getPlaybackState(userId: string): Promise<null | PlaybackState>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  setPlaybackState(userId: string, state: PlaybackState): Promise<void>
}

export interface PlaybackState {
  positionMs: number
  trackId: string | null
  updatedAt: string | null
}
