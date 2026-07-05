import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { CreatePlaylistUseCase } from '#application/useCases/playlist/CreatePlaylist.js'
import type User from '#domain/user/User.js'
import PlaylistRepositoryMemory from '#infra/repository/PlaylistRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let createPlaylistUseCase: CreatePlaylistUseCase
let playlistRepository: PlaylistRepositoryMemory
let dummyUser: User

describe('CreatePlaylistUseCase', () => {
	beforeEach(() => {
		dummyUser = createDummyUser()
		playlistRepository = new PlaylistRepositoryMemory()
		createPlaylistUseCase = new CreatePlaylistUseCase(playlistRepository)
	})

	it('should create a new playlist', async () => {
		const input = {
			name: 'My Playlist',
			ownerId: dummyUser.id,
			isPublic: true,
		}
		const result = await createPlaylistUseCase.execute(input)
		expect(result.id).toBeDefined()
		expect(result.name).toBe(input.name)
		expect(result.isPublic).toBe(true)
		expect(result.ownerId).toBe(dummyUser.id)
	})

	it('should create a private playlist by default', async () => {
		const input = {
			name: 'Private',
			ownerId: dummyUser.id,
		}
		const result = await createPlaylistUseCase.execute(input)
		expect(result.isPublic).toBe(true)
	})
})
