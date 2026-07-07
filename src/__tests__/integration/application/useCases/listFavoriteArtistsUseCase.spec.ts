import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import { ListFavoriteArtistsUseCase } from '#application/useCases/favorite/ListFavoriteArtists.js'
import User from '#domain/user/User.js'
import Artist from '#domain/artist/Artist.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: ListFavoriteArtistsUseCase
let artistRepo: ArtistRepository
let favoriteRepo: FavoriteRepository
let artist: Artist

describe('ListFavoriteArtistsUseCase', () => {
  beforeEach(() => {
    const user = createDummyUser()
    artist = createDummyArtist(user)
    artistRepo = new ArtistRepositoryMemory([artist])
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new ListFavoriteArtistsUseCase(artistRepo, favoriteRepo)
  })

  it('should return empty list when user has no favorites', async () => {
    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(0)
  })

  it('should return favorited artists', async () => {
    await favoriteRepo.add('user-1', artist.id, 'ARTIST')

    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(artist.id)
    expect(result[0]!.userId).toBe(artist.userId)
    expect(result[0]!.bio).toBe(artist.bio)
  })
})
