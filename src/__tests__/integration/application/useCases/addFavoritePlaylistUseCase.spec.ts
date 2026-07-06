import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import { AddFavoritePlaylistUseCase } from '#application/useCases/favorite/AddFavoritePlaylist.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import User from '#domain/user/User.js'
import Playlist from '#domain/playlist/Playlist.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: AddFavoritePlaylistUseCase
let playlistRepo: PlaylistRepository
let favoriteRepo: FavoriteRepository
let playlist: Playlist

describe('AddFavoritePlaylistUseCase', () => {
  beforeEach(() => {
    const owner = createDummyUser()
    playlist = createDummyPlaylist(owner)
    playlistRepo = new PlaylistRepositoryMemory([playlist])
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new AddFavoritePlaylistUseCase(playlistRepo, favoriteRepo)
  })

  it('should add a playlist to favorites', async () => {
    await useCase.execute({ userId: 'user-1', playlistId: playlist.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'PLAYLIST')
    expect(ids).toContain(playlist.id)
  })

  it('should be idempotent when adding same playlist twice', async () => {
    await useCase.execute({ userId: 'user-1', playlistId: playlist.id })
    await useCase.execute({ userId: 'user-1', playlistId: playlist.id })

    const ids = await favoriteRepo.findEntityIdsByUserAndType('user-1', 'PLAYLIST')
    expect(ids).toHaveLength(1)
  })

  it('should throw PlaylistNotFoundError when playlist does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    await expect(useCase.execute({ userId: 'user-1', playlistId: fakeId })).rejects.toThrow(PlaylistNotFoundError)
  })
})
