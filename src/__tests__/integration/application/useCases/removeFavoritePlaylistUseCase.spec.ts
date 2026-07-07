import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import { RemoveFavoritePlaylistUseCase } from '#application/useCases/favorite/RemoveFavoritePlaylist.js'
import User from '#domain/user/User.js'
import Playlist from '#domain/playlist/Playlist.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: RemoveFavoritePlaylistUseCase
let favoriteRepo: FavoriteRepository
let playlist: Playlist

describe('RemoveFavoritePlaylistUseCase', () => {
  beforeEach(() => {
    const owner = createDummyUser()
    playlist = createDummyPlaylist(owner)
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new RemoveFavoritePlaylistUseCase(favoriteRepo)
  })

  it('should remove a playlist from favorites', async () => {
    await favoriteRepo.add('user-1', playlist.id, 'PLAYLIST')

    await useCase.execute({ userId: 'user-1', playlistId: playlist.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'PLAYLIST')
    expect(ids).not.toContain(playlist.id)
  })

  it('should not throw when removing a non-favorited playlist', async () => {
    await expect(
      useCase.execute({ userId: 'user-1', playlistId: playlist.id }),
    ).resolves.toBeUndefined()
  })
})
