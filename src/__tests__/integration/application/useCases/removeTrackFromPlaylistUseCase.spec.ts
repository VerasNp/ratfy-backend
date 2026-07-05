import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import { RemoveTrackFromPlaylistUseCase } from '#application/useCases/playlist/RemoveTrackFromPlaylist.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import type Playlist from '#domain/playlist/Playlist.js'
import type User from '#domain/user/User.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let removeTrackUseCase: RemoveTrackFromPlaylistUseCase
let playlistRepository: PlaylistRepositoryMemory
let dummyUser: User
let dummyPlaylist: Playlist

describe('RemoveTrackFromPlaylistUseCase', () => {
	beforeEach(() => {
		dummyUser = createDummyUser()
		dummyPlaylist = createDummyPlaylist(dummyUser)
		playlistRepository = new PlaylistRepositoryMemory([dummyPlaylist])
		removeTrackUseCase = new RemoveTrackFromPlaylistUseCase(playlistRepository)
	})

	it('should remove a track from the playlist', async () => {
		const trackId = crypto.randomUUID()
		await expect(
			removeTrackUseCase.execute({ playlistId: dummyPlaylist.id, trackId }),
		).resolves.toBeUndefined()
	})

	it('should throw PlaylistNotFoundError if playlist does not exist', async () => {
		await expect(
			removeTrackUseCase.execute({ playlistId: crypto.randomUUID(), trackId: crypto.randomUUID() }),
		).rejects.toThrow(PlaylistNotFoundError)
	})
})
