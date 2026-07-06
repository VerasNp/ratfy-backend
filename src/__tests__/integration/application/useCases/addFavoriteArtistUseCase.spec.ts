import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import { AddFavoriteArtistUseCase } from '#application/useCases/favorite/AddFavoriteArtist.js'
import { ArtistNotFoundError } from '#application/errors/ArtistNotFoundError.js'
import User from '#domain/user/User.js'
import Artist from '#domain/artist/Artist.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: AddFavoriteArtistUseCase
let artistRepo: ArtistRepository
let favoriteRepo: FavoriteRepository
let artist: Artist

describe('AddFavoriteArtistUseCase', () => {
  beforeEach(() => {
    const user = createDummyUser()
    artist = createDummyArtist(user)
    artistRepo = new ArtistRepositoryMemory([artist])
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new AddFavoriteArtistUseCase(artistRepo, favoriteRepo)
  })

  it('should add an artist to favorites', async () => {
    await useCase.execute({ userId: 'user-1', artistId: artist.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'ARTIST')
    expect(ids).toContain(artist.id)
  })

  it('should be idempotent when adding same artist twice', async () => {
    await useCase.execute({ userId: 'user-1', artistId: artist.id })
    await useCase.execute({ userId: 'user-1', artistId: artist.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'ARTIST')
    expect(ids).toHaveLength(1)
  })

  it('should throw ArtistNotFoundError when artist does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    await expect(useCase.execute({ userId: 'user-1', artistId: fakeId })).rejects.toThrow(ArtistNotFoundError)
  })
})
