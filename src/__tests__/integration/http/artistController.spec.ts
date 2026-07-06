import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { createTestServer } from '#__tests__/testServer.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import CreateArtistUseCase from '#application/useCases/artist/CreateArtistUseCase.js'
import DeleteArtistUseCase from '#application/useCases/artist/DeleteArtistUseCase.js'
import UpdateArtistUseCase from '#application/useCases/artist/UpdateArtistUseCase.js'
import Role from '#domain/rbac/role/Role.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import UserDomain from '#domain/user/User.js'
import ArtistController from '#infra/controllers/ArtistController.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import { authMiddlewareMock } from '#infra/http/middlewares/__mocks__/authMiddlewareMock.js'
import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import UserRoleRepositoryMemory from '#infra/repository/rbac/UserRoleRepositoryMemory.js'
import { BecomeArtistUseCase } from '#application/useCases/artist/BecomeArtistUseCase.js'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'

describe('ArtistController', () => {
	let dummyUsers: User[]
	let dummyArtists: Artist[]
	beforeEach(() => {
		dummyUsers = []
		dummyArtists = []
		for (let i = 1; i <= 30; i++) {
			const dummyUser = createDummyUser({
				name: `User ${i}`,
				email: `foo${i}@bar.com`,
			})
			dummyUsers.push(dummyUser)
			const dummyArtist = createDummyArtist(dummyUser)
			dummyArtists.push(dummyArtist)
		}
	})
	describe('GET /artists', () => {
		let artistRepository: ArtistRepository
		let server: ExpressAdapter
		beforeEach(() => {
			server = createTestServer()
			artistRepository = new ArtistRepositoryMemory(dummyArtists)
			new ArtistController(
				server,
				artistRepository,
				null as any,
				null as any,
				null as any,
				authMiddlewareMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success querying artists with limit and page', async () => {
			const res = await request(server.app).get('/artists?limit=15&page=1')
			expect(res.status).toBe(200)
			expect(res.body.data).toHaveLength(15)
			expect(res.body.data[0]).toEqual({
				id: dummyArtists[0]!.id,
				bio: dummyArtists[0]!.bio,
				userId: dummyArtists[0]!.userId,
				user: {
					name: dummyUsers[0]!.name,
				},
			})
		})
		it('should return 200 on success querying artists with a search query', async () => {
			const res = await request(server.app).get('/artists?limit=15&page=1&query=User 1')
			expect(res.status).toBe(200)
			expect(res.body.data).toHaveLength(11)
			expect(res.body.data[0]).toEqual({
				id: dummyArtists[0]!.id,
				bio: dummyArtists[0]!.bio,
				userId: dummyArtists[0]!.userId,
				user: {
					name: dummyUsers[0]!.name,
				},
			})
		})
	})
	describe('GET /artists/:artistId', () => {
		let artistRepository: ArtistRepository
		let server: ExpressAdapter
		beforeEach(() => {
			server = createTestServer()
			artistRepository = new ArtistRepositoryMemory(dummyArtists)
			new ArtistController(
				server,
				artistRepository,
				null as any,
				null as any,
				null as any,
				authMiddlewareMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success querying an artist by id', async () => {
			const res = await request(server.app).get(`/artists/${dummyArtists[0]!.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyArtists[0]!.id,
				bio: dummyArtists[0]!.bio,
				userId: dummyArtists[0]!.userId,
				user: {
					name: dummyUsers[0]!.name,
				},
			})
		})
		it('should return 404 when artist is not found', async () => {
			const res = await request(server.app).get('/artists/non-existent-id')
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'Artist not found',
			})
		})
	})
	describe('POST /artists', () => {
		let artistRepository: ArtistRepository
		let userRepository: UserRepository
		let server: ExpressAdapter
		let createArtistUseCase: CreateArtistUseCase
		beforeEach(() => {
			server = createTestServer()
			artistRepository = new ArtistRepositoryMemory()
			userRepository = new UserRepositoryMemory(dummyUsers)
			createArtistUseCase = new CreateArtistUseCase(artistRepository, userRepository, loggerPortMock)
			new ArtistController(
				server,
				artistRepository,
				createArtistUseCase,
				null as any,
				null as any,
				authMiddlewareMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 201 on success creating an artist', async () => {
			const input = {
				userId: dummyUsers[0]!.id,
				bio: 'This is a test bio',
			}
			const res = await request(server.app).post('/artists').send(input)
			expect(res.status).toBe(201)
			expect(res.body.data).toEqual({
				id: expect.any(String),
				userId: input.userId,
				bio: input.bio,
				user: {
					name: dummyUsers[0]!.name,
				},
			})
		})
		it('should return 404 when trying to create an artist for a non-existent user', async () => {
			const input = {
				userId: 'non-existent-id',
				bio: 'This is a test bio',
			}
			const res = await request(server.app).post('/artists').send(input)
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'User not found',
			})
		})
		it('should return 409 when trying to create an artist for a user that is already an artist', async () => {
			const existingArtist = createDummyArtist(dummyUsers[0]!)
			artistRepository.create(existingArtist)

			const input = {
				userId: dummyUsers[0]!.id,
				bio: 'This is a test bio',
			}
			const res = await request(server.app).post('/artists').send(input)
			expect(res.status).toBe(409)
			expect(res.body).toEqual({
				message: 'This user is already an artist',
			})
		})
		it('should return 400 on invalid input', async () => {
			const input = {
				userId: null,
				bio: 'Valid bio',
			}
			const res = await request(server.app).post('/artists').send(input)
			expect(res.status).toBe(400)
			expect(res.body.message).toBe('Invalid input')
			expect(res.body.errors).toBeDefined()
		})
	})
	describe('PATCH /artists/:artistId', () => {
		let artistRepository: ArtistRepository
		let server: ExpressAdapter
		let updateArtistUseCase: UpdateArtistUseCase
		beforeEach(() => {
			server = createTestServer()
			artistRepository = new ArtistRepositoryMemory(dummyArtists)
			updateArtistUseCase = new UpdateArtistUseCase(artistRepository, loggerPortMock)
			new ArtistController(
				server,
				artistRepository,
				null as any,
				updateArtistUseCase,
				null as any,
				authMiddlewareMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success updating an artist', async () => {
			const input = {
				bio: 'Updated bio',
			}
			const res = await request(server.app).patch(`/artists/${dummyArtists[0]!.id}`).send(input)
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyArtists[0]!.id,
				bio: input.bio,
				userId: dummyArtists[0]!.userId,
				user: {
					name: dummyUsers[0]!.name,
				},
			})
		})
		it('should return 404 when trying to update a non-existent artist', async () => {
			const input = {
				bio: 'Updated bio',
			}
			const res = await request(server.app).patch('/artists/non-existent-id').send(input)
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'Artist not found',
			})
		})
		it('should return 400 on invalid input', async () => {
			const input = {
				bio: 123,
			}
			const res = await request(server.app).patch(`/artists/${dummyArtists[0]!.id}`).send(input)
			expect(res.status).toBe(400)
			expect(res.body.message).toBe('Invalid input')
			expect(res.body.errors).toBeDefined()
		})
	})
	describe('DELETE /artists/:artistId', () => {
		let artistRepository: ArtistRepository
		let server: ExpressAdapter
		let deleteArtistUseCase: DeleteArtistUseCase
		beforeEach(() => {
			server = createTestServer()
			artistRepository = new ArtistRepositoryMemory(dummyArtists)
			deleteArtistUseCase = new DeleteArtistUseCase(artistRepository)
			new ArtistController(
				server,
				artistRepository,
				null as any,
				null as any,
				deleteArtistUseCase,
				authMiddlewareMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success deleting an artist', async () => {
			const res = await request(server.app).delete(`/artists/${dummyArtists[0]!.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyArtists[0]!.id,
				bio: dummyArtists[0]!.bio,
				userId: dummyArtists[0]!.userId,
				user: {
					name: dummyUsers[0]!.name,
				},
			})
		})
		it('should return 404 when trying to delete a non-existent artist', async () => {
			const res = await request(server.app).delete('/artists/non-existent-id')
			expect(res.status).toBe(404)
			expect(res.body).toEqual({
				message: 'Artist not found',
			})
		})
	})
	describe('POST /become-artist', () => {
		let artistRepository: ArtistRepository
		let userRepository: UserRepository
		let roleRepository: RoleRepositoryMemory
		let userRoleRepository: UserRoleRepositoryMemory
		let server: ExpressAdapter
		let becomeArtistUseCase: BecomeArtistUseCase
		const mockUserId = 'dummy-user-id'
		beforeEach(() => {
			server = createTestServer()
			artistRepository = new ArtistRepositoryMemory()
			userRepository = new UserRepositoryMemory()
			roleRepository = new RoleRepositoryMemory()
			userRoleRepository = new UserRoleRepositoryMemory(roleRepository.roles)
			becomeArtistUseCase = new BecomeArtistUseCase(
				userRepository,
				artistRepository,
				roleRepository,
				userRoleRepository,
				unitOfWorkMock,
				loggerPortMock,
			)
			new ArtistController(
				server,
				artistRepository,
				null as any,
				null as any,
				null as any,
				authMiddlewareMock,
				becomeArtistUseCase,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on success creating an artist profile', async () => {
			const dummyUser = UserDomain.restore(
				mockUserId,
				'John Doe',
				'john@example.com',
				'Valid@123',
				new Date('1990-01-01'),
				new Date(),
			)
			await userRepository.create(dummyUser)
			const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
			await roleRepository.createRole(artistRole)

			const res = await request(server.app).post('/become-artist').send({ bio: 'My bio' })

			expect(res.status).toBe(200)
			expect(res.body.data.id).toBeDefined()
			expect(res.body.data.userId).toBe(mockUserId)
			expect(res.body.data.bio).toBe('My bio')
		})
		it('should return 200 on success with null bio', async () => {
			const dummyUser = UserDomain.restore(
				mockUserId,
				'Jane Doe',
				'jane@example.com',
				'Valid@123',
				new Date('1990-01-01'),
				new Date(),
			)
			await userRepository.create(dummyUser)
			const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
			await roleRepository.createRole(artistRole)

			const res = await request(server.app).post('/become-artist').send({})

			expect(res.status).toBe(200)
			expect(res.body.data.bio).toBeNull()
		})
		it('should return 409 when user already has an artist profile', async () => {
			const dummyUser = UserDomain.restore(
				mockUserId,
				'Bob',
				'bob@example.com',
				'Valid@123',
				new Date('1990-01-01'),
				new Date(),
			)
			await userRepository.create(dummyUser)
			const dummyArtist = createDummyArtist(dummyUser, { bio: null })
			await artistRepository.create(dummyArtist)
			const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
			await roleRepository.createRole(artistRole)

			const res = await request(server.app).post('/become-artist').send({})

			expect(res.status).toBe(409)
			expect(res.body.message).toBe('User already has an artist profile')
		})
		it('should return 401 when email is not verified', async () => {
			const unverifiedUser = UserDomain.restore(
				mockUserId,
				'Dave',
				'dave@example.com',
				'Valid@123',
				new Date('1990-01-01'),
				null,
			)
			await userRepository.create(unverifiedUser)
			const artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
			await roleRepository.createRole(artistRole)

			const res = await request(server.app).post('/become-artist').send({ bio: 'My bio' })

			expect(res.status).toBe(401)
		})
	})
})
