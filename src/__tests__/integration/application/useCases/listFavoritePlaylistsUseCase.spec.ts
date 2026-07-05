import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import type { FavoriteRepository } from '#application/ports/FavoriteRepository.js'
import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import { ListFavoritePlaylistsUseCase } from '#application/useCases/favorite/ListFavoritePlaylists.js'
import User from '#domain/user/User.js'
import Playlist from '#domain/playlist/Playlist.js'
import FavoriteRepositoryMemory from '#infra/repository/FavoriteRepositoryMemory.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let useCase: ListFavoritePlaylistsUseCase
let playlistRepo: PlaylistRepository
let favoriteRepo: FavoriteRepository
let playlist: Playlist

describe('ListFavoritePlaylistsUseCase', () => {
  beforeEach(() => {
    const owner = createDummyUser()
    playlist = createDummyPlaylist(owner)
    playlistRepo = new PlaylistRepositoryMemory([playlist])
    favoriteRepo = new FavoriteRepositoryMemory()
    useCase = new ListFavoritePlaylistsUseCase(playlistRepo, favoriteRepo)
  })

  it('should return empty list when user has no favorites', async () => {
    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(0)
  })

  it('should return favorited playlists', async () => {
    await favoriteRepo.add('user-1', playlist.id, 'PLAYLIST')

    const result = await useCase.execute({ userId: 'user-1' })
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(playlist.id)
    expect(result[0]!.name).toBe(playlist.name)
  })
})
