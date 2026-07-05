import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import { ListFavoriteAlbumsUseCase } from '#application/useCases/favorite/ListFavoriteAlbums.js'
import Album from '#domain/album/Album.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: ListFavoriteAlbumsUseCase
let albumRepo: AlbumRepository
let favoriteRepo: FavoriteRepository
let album: Album

describe('ListFavoriteAlbumsUseCase', () => {
  beforeEach(() => {
    const user = createDummyUser()
    const artist = createDummyArtist(user)
    album = createDummyAlbum({ artists: [artist] })
    albumRepo = new AlbumRepositoryMemory([album])
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new ListFavoriteAlbumsUseCase(albumRepo, favoriteRepo)
  })

  it('should return empty list when user has no favorites', async () => {
    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(0)
  })

  it('should return favorited albums', async () => {
    await favoriteRepo.add('user-1', album.id, 'ALBUM')

    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(album.id)
    expect(result[0]!.name).toBe(album.name)
  })
})
