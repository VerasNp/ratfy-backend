import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import { UpdatePlaylistUseCase } from '#application/useCases/playlist/UpdatePlaylist.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import type Playlist from '#domain/playlist/Playlist.js'
import type User from '#domain/user/User.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let updatePlaylistUseCase: UpdatePlaylistUseCase
let playlistRepository: PlaylistRepositoryMemory
let dummyUser: User
let dummyPlaylist: Playlist

describe('UpdatePlaylistUseCase', () => {
	beforeEach(() => {
		dummyUser = createDummyUser()
		dummyPlaylist = createDummyPlaylist(dummyUser)
		playlistRepository = new PlaylistRepositoryMemory([dummyPlaylist])
		updatePlaylistUseCase = new UpdatePlaylistUseCase(playlistRepository)
	})

	it('should update a playlist name', async () => {
		await updatePlaylistUseCase.execute(dummyPlaylist.id, { name: 'Updated Name' })
		const updated = await playlistRepository.findById(dummyPlaylist.id)
		expect(updated!.name).toBe('Updated Name')
	})

	it('should throw PlaylistNotFoundError if playlist does not exist', async () => {
		await expect(
			updatePlaylistUseCase.execute(crypto.randomUUID(), { name: 'Nope' }),
		).rejects.toThrow(PlaylistNotFoundError)
	})
})
