import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import { AddFavoriteTrackUseCase } from '#application/useCases/favorite/AddFavoriteTrack.js'
import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'
import Track from '#domain/track/Track.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import TrackRepositoryMemory from '#infra/repository/TrackRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: AddFavoriteTrackUseCase
let trackRepo: TrackRepository
let favoriteRepo: FavoriteRepository
let track: Track

describe('AddFavoriteTrackUseCase', () => {
  beforeEach(() => {
    track = createDummyTrack()
    trackRepo = new TrackRepositoryMemory([track])
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new AddFavoriteTrackUseCase(trackRepo, favoriteRepo)
  })

  it('should add a track to favorites', async () => {
    await useCase.execute({ userId: 'user-1', trackId: track.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'TRACK')
    expect(ids).toContain(track.id)
  })

  it('should be idempotent when adding same track twice', async () => {
    await useCase.execute({ userId: 'user-1', trackId: track.id })
    await useCase.execute({ userId: 'user-1', trackId: track.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'TRACK')
    expect(ids).toHaveLength(1)
  })

  it('should throw TrackNotFoundError when track does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    await expect(useCase.execute({ userId: 'user-1', trackId: fakeId })).rejects.toThrow(TrackNotFoundError)
  })
})
