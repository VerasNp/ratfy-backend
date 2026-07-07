import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyAlbum } from '#__tests__/factories/AlbumFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import { AddFavoriteAlbumUseCase } from '#application/useCases/favorite/AddFavoriteAlbum.js'
import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import Album from '#domain/album/Album.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import AlbumRepositoryMemory from '#infra/repository/AlbumRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: AddFavoriteAlbumUseCase
let albumRepo: AlbumRepository
let favoriteRepo: FavoriteRepository
let album: Album

describe('AddFavoriteAlbumUseCase', () => {
  beforeEach(() => {
    const user = createDummyUser()
    const artist = createDummyArtist(user)
    album = createDummyAlbum({ artists: [artist] })
    albumRepo = new AlbumRepositoryMemory([album])
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new AddFavoriteAlbumUseCase(albumRepo, favoriteRepo)
  })

  it('should add an album to favorites', async () => {
    await useCase.execute({ userId: 'user-1', albumId: album.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'ALBUM')
    expect(ids).toContain(album.id)
  })

  it('should be idempotent when adding same album twice', async () => {
    await useCase.execute({ userId: 'user-1', albumId: album.id })
    await useCase.execute({ userId: 'user-1', albumId: album.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'ALBUM')
    expect(ids).toHaveLength(1)
  })

  it('should throw AlbumNotFoundError when album does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    await expect(useCase.execute({ userId: 'user-1', albumId: fakeId })).rejects.toThrow(AlbumNotFoundError)
  })
})
