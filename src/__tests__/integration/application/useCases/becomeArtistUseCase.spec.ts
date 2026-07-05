import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import MissingApplicationSetupError from '#application/errors/MissingApplicationSetupError.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'
import { BecomeArtistUseCase } from '#application/useCases/artist/BecomeArtistUseCase.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import UserRoleRepositoryMemory from '#infra/repository/rbac/UserRoleRepositoryMemory.js'
import Role from '#domain/rbac/role/Role.js'
import { beforeEach, describe, expect, it } from 'vitest'

let becomeArtistUseCase: BecomeArtistUseCase
let userRepository: UserRepositoryMemory
let roleRepository: RoleRepositoryMemory
let userRoleRepository: UserRoleRepositoryMemory
let artistRepository: ArtistRepository

describe('BecomeArtistUseCase', () => {
	beforeEach(() => {
		userRepository = new UserRepositoryMemory()
		roleRepository = new RoleRepositoryMemory()
		userRoleRepository = new UserRoleRepositoryMemory(roleRepository.roles)
		artistRepository = new ArtistRepositoryMemory()
		becomeArtistUseCase = new BecomeArtistUseCase(
			userRepository,
			artistRepository,
			roleRepository,
			userRoleRepository,
			unitOfWorkMock,
			loggerPortMock,
		)
	})

	it('should create an artist and assign the ARTIST role', async () => {
		const dummyUser = createDummyUser({ verifiedAt: new Date() })
		await userRepository.create(dummyUser)
		const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
		await roleRepository.createRole(artistRole)

		const result = await becomeArtistUseCase.execute(dummyUser.id, { bio: 'My bio' })

		expect(result.id).toBeDefined()
		expect(result.userId).toBe(dummyUser.id)
		expect(result.bio).toBe('My bio')

		const persistedArtist = await artistRepository.findByUserId(dummyUser.id)
		expect(persistedArtist).not.toBeNull()
		expect(persistedArtist!.id).toBe(result.id)

		const userRoles = await userRoleRepository.findRolesByUserId(dummyUser.id)
		expect(userRoles).toHaveLength(1)
		expect(userRoles[0]!.id).toBe(artistRole.id)
	})

	it('should create an artist with null bio when not provided', async () => {
		const dummyUser = createDummyUser({ verifiedAt: new Date() })
		await userRepository.create(dummyUser)
		const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
		await roleRepository.createRole(artistRole)

		const result = await becomeArtistUseCase.execute(dummyUser.id, {})

		expect(result.bio).toBeNull()
	})

	it('should throw ResourceNotFoundError when user does not exist', async () => {
		const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
		await roleRepository.createRole(artistRole)

		await expect(
			becomeArtistUseCase.execute(crypto.randomUUID(), {}),
		).rejects.toThrow(ResourceNotFoundError)
	})

	it('should throw ResourceAlreadyExistsError when user already has an artist profile', async () => {
		const dummyUser = createDummyUser({ verifiedAt: new Date() })
		await userRepository.create(dummyUser)
		const dummyArtist = createDummyArtist(dummyUser, { bio: null })
		await artistRepository.create(dummyArtist)
		const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
		await roleRepository.createRole(artistRole)

		await expect(
			becomeArtistUseCase.execute(dummyUser.id, {}),
		).rejects.toThrow(ResourceAlreadyExistsError)
	})

	it('should throw UnauthorizedError when email is not verified', async () => {
		const unverifiedUser = createDummyUser({
			name: 'Dave',
			email: 'dave@example.com',
		})
		await userRepository.create(unverifiedUser)

		await expect(
			becomeArtistUseCase.execute(unverifiedUser.id, {}),
		).rejects.toThrow(UnauthorizedError)
	})

	it('should throw MissingApplicationSetupError when ARTIST role does not exist', async () => {
		const dummyUser = createDummyUser({ verifiedAt: new Date() })
		await userRepository.create(dummyUser)

		await expect(
			becomeArtistUseCase.execute(dummyUser.id, {}),
		).rejects.toThrow(MissingApplicationSetupError)
	})
})
