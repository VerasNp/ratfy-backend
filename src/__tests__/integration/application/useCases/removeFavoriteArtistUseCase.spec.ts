import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { RemoveFavoriteArtistUseCase } from '#application/useCases/favorite/RemoveFavoriteArtist.js'
import User from '#domain/user/User.js'
import Artist from '#domain/artist/Artist.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: RemoveFavoriteArtistUseCase
let favoriteRepo: FavoriteRepository
let artist: Artist

describe('RemoveFavoriteArtistUseCase', () => {
  beforeEach(() => {
    const user = createDummyUser()
    artist = createDummyArtist(user)
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new RemoveFavoriteArtistUseCase(favoriteRepo)
  })

  it('should remove an artist from favorites', async () => {
    await favoriteRepo.add('user-1', artist.id, 'ARTIST')

    await useCase.execute({ userId: 'user-1', artistId: artist.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'ARTIST')
    expect(ids).not.toContain(artist.id)
  })

  it('should not throw when removing a non-favorited artist', async () => {
    await expect(
      useCase.execute({ userId: 'user-1', artistId: artist.id }),
    ).resolves.toBeUndefined()
  })
})
