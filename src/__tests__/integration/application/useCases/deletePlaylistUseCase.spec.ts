import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import { DeletePlaylistUseCase } from '#application/useCases/playlist/DeletePlaylist.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import { favoriteRepositoryMock } from '#application/ports/__mocks__/FavoriteRepositoryMock.js'
import type Playlist from '#domain/playlist/Playlist.js'
import type User from '#domain/user/User.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let deletePlaylistUseCase: DeletePlaylistUseCase
let playlistRepository: PlaylistRepositoryMemory
let dummyUser: User
let dummyPlaylist: Playlist

describe('DeletePlaylistUseCase', () => {
	beforeEach(() => {
		dummyUser = createDummyUser()
		dummyPlaylist = createDummyPlaylist(dummyUser)
		playlistRepository = new PlaylistRepositoryMemory([dummyPlaylist])
		deletePlaylistUseCase = new DeletePlaylistUseCase(playlistRepository, favoriteRepositoryMock)
	})

	it('should delete an existing playlist', async () => {
		await deletePlaylistUseCase.execute({ id: dummyPlaylist.id })
		const found = await playlistRepository.findById(dummyPlaylist.id)
		expect(found).toBeNull()
	})

	it('should throw PlaylistNotFoundError if playlist does not exist', async () => {
		await expect(
			deletePlaylistUseCase.execute({ id: crypto.randomUUID() }),
		).rejects.toThrow(PlaylistNotFoundError)
	})
})
