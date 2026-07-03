import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import UpdateArtistUseCase from '#application/useCases/artist/UpdateArtistUseCase.js'
import Artist from '#domain/artist/Artist.js'
import User from '#domain/user/User.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import { beforeAll, describe, expect, it } from 'vitest'

let artistRepository: ArtistRepository
let updateArtistUseCase: UpdateArtistUseCase

beforeAll(() => {
	artistRepository = new ArtistRepositoryMemory()
	updateArtistUseCase = new UpdateArtistUseCase(artistRepository, loggerPortMock)
})

describe('UpdateArtistUseCase', () => {
	it('should not update an artist if it does not exist', async () => {
		await expect(
			updateArtistUseCase.execute('non-existent-artist-id', { bio: 'New bio' }),
		).rejects.toThrow('Artist not found')
	})
	it('should update an existing artist', async () => {
		const dummyUser = createDummyUser()
		const dummyArtist = Artist.create({
			bio: 'Original bio',
			user: dummyUser,
		})
		await artistRepository.create(dummyArtist)
		const input = {
			bio: 'Updated bio',
		}
		const result = await updateArtistUseCase.execute(dummyArtist.id, input)
		expect(result.id).toBe(dummyArtist.id)
		expect(result.bio).toBe(input.bio)
		expect(result.userId).toBe(dummyArtist.userId)
		expect(result.user.name).toBe(dummyUser.name)
	})
})
