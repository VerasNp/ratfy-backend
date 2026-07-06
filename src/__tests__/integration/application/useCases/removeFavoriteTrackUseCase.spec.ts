import { createDummyTrack } from '#__tests__/factories/TrackFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { RemoveFavoriteTrackUseCase } from '#application/useCases/favorite/RemoveFavoriteTrack.js'
import Track from '#domain/track/Track.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: RemoveFavoriteTrackUseCase
let favoriteRepo: FavoriteRepository
let track: Track

describe('RemoveFavoriteTrackUseCase', () => {
  beforeEach(() => {
    track = createDummyTrack()
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new RemoveFavoriteTrackUseCase(favoriteRepo)
  })

  it('should remove a track from favorites', async () => {
    await favoriteRepo.add('user-1', track.id, 'TRACK')

    await useCase.execute({ userId: 'user-1', trackId: track.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'TRACK')
    expect(ids).not.toContain(track.id)
  })

  it('should not throw when removing a non-favorited track', async () => {
    await expect(
      useCase.execute({ userId: 'user-1', trackId: track.id }),
    ).resolves.toBeUndefined()
  })
})
