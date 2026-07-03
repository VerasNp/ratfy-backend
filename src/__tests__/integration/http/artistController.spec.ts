import { createTestServer } from '#__tests__/testServer.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import BecomeArtistUseCase from '#application/useCases/artist/BecomeArtistUseCase.js'
import InvalidTokenError from '#application/errors/InvalidTokenError.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'
import Artist from '#domain/artist/Artist.js'
import Role from '#domain/rbac/role/Role.js'
import User from '#domain/user/User.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import ArtistController from '#infra/controllers/ArtistController.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import UserRoleRepositoryMemory from '#infra/repository/rbac/UserRoleRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'

class ArtistRepositoryMemory implements ArtistRepository {
	public artists: Artist[] = []

	public constructor(initialArtists: Artist[] = []) {
		this.artists = initialArtists
	}

	public create(artist: Artist, _tx?: any): Promise<Artist> {
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

let server: ExpressAdapter
let userRepository: UserRepositoryMemory
let roleRepository: RoleRepositoryMemory
let artistRepository: ArtistRepositoryMemory
let userRoleRepository: UserRoleRepositoryMemory

function buildController(authMiddlewareMock: any) {
	const becomeArtistUseCase = new BecomeArtistUseCase(
		userRepository,
		artistRepository,
		roleRepository,
		userRoleRepository,
		unitOfWorkMock,
		loggerPortMock,
	)

	new ArtistController(
		server,
		null as any,
		null as any,
		null as any,
		null as any,
		null as any,
		null as any,
		authMiddlewareMock,
		becomeArtistUseCase,
	)
}

describe('ArtistController - POST /become-artist', () => {
	describe('with valid auth', () => {
		let dummyUser: User
		let artistRole: Role
		let authMiddlewareMock: any

		beforeEach(() => {
			server = createTestServer()
			dummyUser = User.create('John Doe', 'john@example.com', 'Valid@123', new Date('1990-01-01'), new Date())
			userRepository = new UserRepositoryMemory([dummyUser])
			artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
			roleRepository = new RoleRepositoryMemory([artistRole])
			artistRepository = new ArtistRepositoryMemory()
			userRoleRepository = new UserRoleRepositoryMemory()

			authMiddlewareMock = {
				handle: () => {
					return (req: any, _res: any, next: any) => {
						req.user = { userId: dummyUser.id }
						next()
					}
				},
			}

			buildController(authMiddlewareMock)
			server.registerErrorHandler()
		})

		it('should create an artist with bio', async () => {
			const res = await request(server.app)
				.post('/become-artist')
				.send({ bio: 'My biography' })

			expect(res.status).toBe(200)
			expect(res.body.body.id).toBeDefined()
			expect(res.body.body.userId).toBe(dummyUser.id)
			expect(res.body.body.bio).toBe('My biography')
			expect(res.body.body.createdAt).toBeDefined()
			expect(res.body.body.updatedAt).toBeDefined()
		})

		it('should create an artist with null bio', async () => {
			const res = await request(server.app)
				.post('/become-artist')
				.send({})

			expect(res.status).toBe(200)
			expect(res.body.body.bio).toBeNull()
		})

		it('should return 409 when user already has an artist profile', async () => {
			await artistRepository.create(Artist.create({ userId: dummyUser.id }))

			const res = await request(server.app)
				.post('/become-artist')
				.send({})

			expect(res.status).toBe(409)
			expect(res.body.message).toBe('User already has an artist profile')
		})
	})

	describe('with unverified email', () => {
		let dummyUser: User
		let artistRole: Role
		let authMiddlewareMock: any

		beforeEach(() => {
			server = createTestServer()
			dummyUser = User.create('Jane Doe', 'jane@example.com', 'Valid@123', new Date('1990-01-01'))
			userRepository = new UserRepositoryMemory([dummyUser])
			artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
			roleRepository = new RoleRepositoryMemory([artistRole])
			artistRepository = new ArtistRepositoryMemory()
			userRoleRepository = new UserRoleRepositoryMemory()

			authMiddlewareMock = {
				handle: () => {
					return (req: any, _res: any, next: any) => {
						req.user = { userId: dummyUser.id }
						next()
					}
				},
			}

			buildController(authMiddlewareMock)
			server.registerErrorHandler()
		})

		it('should return 401 when email is not verified', async () => {
			const res = await request(server.app)
				.post('/become-artist')
				.send({ bio: 'My bio' })

			expect(res.status).toBe(401)
		})
	})

	describe('without auth', () => {
		let authMiddlewareMock: any

		beforeEach(() => {
			server = createTestServer()
			userRepository = new UserRepositoryMemory()
			roleRepository = new RoleRepositoryMemory()
			artistRepository = new ArtistRepositoryMemory()
			userRoleRepository = new UserRoleRepositoryMemory()

			authMiddlewareMock = {
				handle: () => {
					return (_req: any, _res: any, next: any) => {
						next(new InvalidTokenError())
					}
				},
			}

			buildController(authMiddlewareMock)
			server.registerErrorHandler()
		})

		it('should return 401 when no valid token is provided', async () => {
			const res = await request(server.app)
				.post('/become-artist')
				.send({})

			expect(res.status).toBe(401)
		})
	})
})
