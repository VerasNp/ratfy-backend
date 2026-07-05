import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import { ListFavoriteTracksUseCase } from '#application/useCases/favorite/ListFavoriteTracks.js'
import Track from '#domain/track/Track.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: ListFavoriteTracksUseCase
let trackRepo: TrackRepository
let favoriteRepo: FavoriteRepository
let track: Track

describe('ListFavoriteTracksUseCase', () => {
  beforeEach(() => {
    track = createDummyTrack()
    trackRepo = new TrackRepositoryMemory([track])
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new ListFavoriteTracksUseCase(trackRepo, favoriteRepo)
  })

  it('should return empty list when user has no favorites', async () => {
    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(0)
  })

  it('should return favorited tracks', async () => {
    await favoriteRepo.add('user-1', track.id, 'TRACK')

    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(track.id)
    expect(result[0]!.title).toBe(track.title)
  })

  it('should exclude soft-deleted tracks from the list', async () => {
    await favoriteRepo.add('user-1', track.id, 'TRACK')
    await trackRepo.delete(track.id)

    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(0)
  })
})
