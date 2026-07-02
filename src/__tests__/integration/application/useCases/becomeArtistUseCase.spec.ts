import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import BecomeArtistUseCase from '#application/useCases/artist/BecomeArtistUseCase.js'
import Artist from '#domain/artist/Artist.js'
import Role from '#domain/rbac/role/Role.js'
import User from '#domain/user/User.js'
import ResourceNotFoundError from '#application/errors/ResourceNotFoundError.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import MissingApplicationSetupError from '#application/errors/MissingApplicationSetupError.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import UserRoleRepositoryMemory from '#infra/repository/rbac/UserRoleRepositoryMemory.js'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

class ArtistRepositoryMemory implements ArtistRepository {
	public artists: Artist[] = []

	public constructor(initialArtists: Artist[] = []) {
		this.artists = initialArtists
	}

	public create(artist: Artist): Promise<Artist> {
		this.artists.push(artist)
		return Promise.resolve(artist)
	}

	public findByUserId(userId: string): Promise<Artist | null> {
		const artist = this.artists.find((a) => a.userId === userId)
		return Promise.resolve(artist || null)
	}

	public findById(_id: string): Promise<Artist | null> {
		throw new Error('not implemented')
	}

	public delete(_id: string): Promise<void> {
		throw new Error('not implemented')
	}

	public listByIds(_ids: string[]): Promise<Artist[]> {
		throw new Error('not implemented')
	}

	public list(_page: number, _limit: number): Promise<Artist[]> {
		throw new Error('not implemented')
	}

	public update(_id: string, _data: Partial<Artist>): Promise<void> {
		throw new Error('not implemented')
	}
}

let becomeArtistUseCase: BecomeArtistUseCase
let userRepository: UserRepositoryMemory
let roleRepository: RoleRepositoryMemory
let userRoleRepository: UserRoleRepositoryMemory
let artistRepository: ArtistRepositoryMemory

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
		const user = User.create('John Doe', 'john@example.com', 'Valid@123', new Date('1990-01-01'))
		await userRepository.create(user)
		const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
		await roleRepository.createRole(artistRole)

		const result = await becomeArtistUseCase.execute(user.id, { bio: 'My bio' })

		expect(result.id).toBeDefined()
		expect(result.userId).toBe(user.id)
		expect(result.bio).toBe('My bio')
		expect(result.createdAt).toBeDefined()
		expect(result.updatedAt).toBeDefined()

		const persistedArtist = await artistRepository.findByUserId(user.id)
		expect(persistedArtist).not.toBeNull()
		expect(persistedArtist!.id).toBe(result.id)

		const userRoles = await userRoleRepository.findRolesByUserId(user.id)
		expect(userRoles).toHaveLength(1)
		expect(userRoles[0]!.id).toBe(artistRole.id)
	})

	it('should create an artist with null bio when not provided', async () => {
		const user = User.create('Jane Doe', 'jane@example.com', 'Valid@123', new Date('1990-01-01'))
		await userRepository.create(user)
		const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
		await roleRepository.createRole(artistRole)

		const result = await becomeArtistUseCase.execute(user.id, {})

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
		const user = User.create('Bob', 'bob@example.com', 'Valid@123', new Date('1990-01-01'))
		await userRepository.create(user)
		const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
		await roleRepository.createRole(artistRole)
		await artistRepository.create(Artist.create({ userId: user.id }))

		await expect(
			becomeArtistUseCase.execute(user.id, {}),
		).rejects.toThrow(ResourceAlreadyExistsError)
	})

	it('should throw MissingApplicationSetupError when ARTIST role does not exist', async () => {
		const user = User.create('Charlie', 'charlie@example.com', 'Valid@123', new Date('1990-01-01'))
		await userRepository.create(user)

		await expect(
			becomeArtistUseCase.execute(user.id, {}),
		).rejects.toThrow(MissingApplicationSetupError)
	})
})
