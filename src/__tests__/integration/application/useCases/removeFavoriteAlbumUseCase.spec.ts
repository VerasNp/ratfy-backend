import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { RemoveFavoriteAlbumUseCase } from '#application/useCases/favorite/RemoveFavoriteAlbum.js'
import Album from '#domain/album/Album.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: RemoveFavoriteAlbumUseCase
let favoriteRepo: FavoriteRepository
let album: Album

describe('RemoveFavoriteAlbumUseCase', () => {
  beforeEach(() => {
    const user = createDummyUser()
    const artist = createDummyArtist(user)
    album = createDummyAlbum({ artists: [artist] })
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new RemoveFavoriteAlbumUseCase(favoriteRepo)
  })

  it('should remove an album from favorites', async () => {
    await favoriteRepo.add('user-1', album.id, 'ALBUM')

    await useCase.execute({ userId: 'user-1', albumId: album.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'ALBUM')
    expect(ids).not.toContain(album.id)
  })

  it('should not throw when removing a non-favorited album', async () => {
    await expect(
      useCase.execute({ userId: 'user-1', albumId: album.id }),
    ).resolves.toBeUndefined()
  })
})
