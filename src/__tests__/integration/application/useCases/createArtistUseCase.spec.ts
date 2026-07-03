import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import CreateArtistUseCase from '#application/useCases/artist/CreateArtistUseCase.js'
import User from '#domain/user/User.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeAll, describe, expect, it } from 'vitest'

let createArtistUseCase: CreateArtistUseCase
let artistRepository: ArtistRepository
let userRepository: UserRepository

beforeAll(() => {
	artistRepository = new ArtistRepositoryMemory()
	userRepository = new UserRepositoryMemory()
	createArtistUseCase = new CreateArtistUseCase(artistRepository, userRepository, loggerPortMock)
})

describe('CreateArtistUseCase', () => {
	it('should not create an artist if the user is not found', async () => {
		const input = {
			userId: 'non-existent-user-id',
			bio: 'This is a test bio',
		}
		await expect(createArtistUseCase.execute(input)).rejects.toThrow('User not found')
	})

	it('should not create an artist if the user is already an artist', async () => {
		const dummyUser = User.create(
			'John Doe',
			'john.doe@example.com',
			'ValidPassword123!',
			new Date(1990, 0, 1),
		)
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
		const dummyUser = User.create(
			'Jane Doe',
			'foo@example.com',
			'ValidPassword123!',
			new Date(1990, 0, 1),
		)
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
	})
})
