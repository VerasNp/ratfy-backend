import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import CreateArtistUseCase from '#application/useCases/artist/CreateArtistUseCase.js'
import type User from '#domain/user/User.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let createArtistUseCase: CreateArtistUseCase
let artistRepository: ArtistRepository
let userRepository: UserRepository
let dummyUser: User

describe('CreateArtistUseCase', () => {
	beforeEach(() => {
		dummyUser = createDummyUser()
		artistRepository = new ArtistRepositoryMemory()
		userRepository = new UserRepositoryMemory()
		createArtistUseCase = new CreateArtistUseCase(artistRepository, userRepository, loggerPortMock)
	})

	it('should not create an artist if the user is not found', async () => {
		const input = {
			userId: 'non-existent-user-id',
			bio: 'This is a test bio',
		}
		await expect(createArtistUseCase.execute(input)).rejects.toThrow('User not found')
	})

	it('should not create an artist if the user is already an artist', async () => {
		await userRepository.create(dummyUser)
		const input = {
			userId: dummyUser.id,
			bio: 'This is a test bio',
		}
		await createArtistUseCase.execute(input)
		await expect(createArtistUseCase.execute(input)).rejects.toThrow(
			'This user is already an artist',
		)
	})

	it('should create a new artist successfully', async () => {
		await userRepository.create(dummyUser)
		const input = {
			userId: dummyUser.id,
			bio: 'This is a test bio',
		}
		const result = await createArtistUseCase.execute(input)
		expect(result.id).toBeDefined()
		expect(result.bio).toBe(input.bio)
		expect(result.userId).toBe(dummyUser.id)
		expect(result.user.name).toBe(dummyUser.name)

		const found = await artistRepository.findById(result.id)
		expect(found).not.toBeNull()
		expect(found!.bio).toBe(input.bio)
	})
})
