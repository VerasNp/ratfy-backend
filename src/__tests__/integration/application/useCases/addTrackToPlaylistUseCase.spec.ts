import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createDummyPlaylist } from '#__tests__/factories/PlaylistFactory.js'
import { AddTrackToPlaylistUseCase } from '#application/useCases/playlist/AddTrackToPlaylist.js'
import { PlaylistNotFoundError } from '#application/errors/PlaylistNotFoundError.js'
import type Playlist from '#domain/playlist/Playlist.js'
import type User from '#domain/user/User.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let addTrackUseCase: AddTrackToPlaylistUseCase
let playlistRepository: PlaylistRepositoryMemory
let dummyUser: User
let dummyPlaylist: Playlist

describe('AddTrackToPlaylistUseCase', () => {
	beforeEach(() => {
		dummyUser = createDummyUser()
		dummyPlaylist = createDummyPlaylist(dummyUser)
		playlistRepository = new PlaylistRepositoryMemory([dummyPlaylist])
		addTrackUseCase = new AddTrackToPlaylistUseCase(playlistRepository)
	})

	it('should add a track to the playlist', async () => {
		const trackId = crypto.randomUUID()
		await addTrackUseCase.execute({ playlistId: dummyPlaylist.id, trackId })
		expect(playlistRepository.tracks.get(dummyPlaylist.id)?.has(trackId)).toBe(true)
	})

	it('should throw PlaylistNotFoundError if playlist does not exist', async () => {
		await expect(
			addTrackUseCase.execute({ playlistId: crypto.randomUUID(), trackId: crypto.randomUUID() }),
		).rejects.toThrow(PlaylistNotFoundError)
	})
})
