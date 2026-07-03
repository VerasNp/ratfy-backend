// import { createTestServer } from '#__tests__/testServer.js'
// import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
// import ArtistController from '#infra/controllers/ArtistController.js'
// import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
// import ArtistRepositoryMemory from '#infra/repository/ArtistRepositoryMemory.js'
// import { beforeEach, describe, expect, it } from 'vitest'
// import request from 'supertest'
// import Artist from '#domain/artist/Artist.js'
// import User from '#domain/user/User.js'
// import CreateArtistUseCase from '#application/useCases/artist/CreateArtistUseCase.js'
// import type { UserRepository } from '#application/ports/UserRepository.js'
// import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
// import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
// import UpdateArtistUseCase from '#application/useCases/artist/UpdateArtistUseCase.js'
// import { createDummyUser } from '#__tests__/factories/UserFactory.js'
// import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
// import DeleteArtistUseCase from '#application/useCases/artist/DeleteArtistUseCase.js'
// import { create } from 'node:domain'
// import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
// import UserRoleRepositoryMemory from '#infra/repository/rbac/UserRoleRepositoryMemory.js'
// import { BecomeArtistUseCase } from '#application/useCases/artist/BecomeArtistUseCase.js'
// import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
// import Role from '#domain/rbac/role/Role.js'
// import InvalidTokenError from '#application/errors/InvalidTokenError.js'

// let server: ExpressAdapter
// let artistRepository: ArtistRepository
// let createArtistUseCase: CreateArtistUseCase
// let userRepository: UserRepository
// let updateArtistUseCase: UpdateArtistUseCase
// let deleteArtistUseCase: DeleteArtistUseCase
// let roleRepository: RoleRepositoryMemory
// let userRoleRepository: UserRoleRepositoryMemory

// function buildController(authMiddlewareMock: any) {
// 	const becomeArtistUseCase = new BecomeArtistUseCase(
// 		userRepository,
// 		artistRepository,
// 		roleRepository,
// 		userRoleRepository,
// 		unitOfWorkMock,
// 		loggerPortMock,
// 	)

// 	new ArtistController(
// 		server,
// 		null as any,
// 		null as any,
// 		null as any,
// 		null as any,
// 		authMiddlewareMock,
// 		becomeArtistUseCase,
// 	)
// }

// describe('ArtistController - POST /become-artist', () => {
// 	describe('with valid auth', () => {
// 		let dummyUser: User
// 		let artistRole: Role
// 		let authMiddlewareMock: any

// 		beforeEach(() => {
// 			server = createTestServer()
// 			dummyUser = User.create(
// 				'John Doe',
// 				'john@example.com',
// 				'Valid@123',
// 				new Date('1990-01-01'),
// 				new Date(),
// 			)
// 			userRepository = new UserRepositoryMemory([dummyUser])
// 			artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
// 			roleRepository = new RoleRepositoryMemory([artistRole])
// 			artistRepository = new ArtistRepositoryMemory()
// 			userRoleRepository = new UserRoleRepositoryMemory()

// 			authMiddlewareMock = {
// 				handle: () => {
// 					return (req: any, _res: any, next: any) => {
// 						req.user = { userId: dummyUser.id }
// 						next()
// 					}
// 				},
// 			}

// 			buildController(authMiddlewareMock)
// 			server.registerErrorHandler()
// 		})

// 		it('should create an artist with bio', async () => {
// 			const res = await request(server.app)
// 				.post('/become-artist')
// 				.send({ bio: 'My biography' })

// 			expect(res.status).toBe(200)
// 			expect(res.body.body.id).toBeDefined()
// 			expect(res.body.body.userId).toBe(dummyUser.id)
// 			expect(res.body.body.bio).toBe('My biography')
// 			expect(res.body.body.createdAt).toBeDefined()
// 			expect(res.body.body.updatedAt).toBeDefined()
// 		})

// 		it('should create an artist with null bio', async () => {
// 			const res = await request(server.app).post('/become-artist').send({})

// 			expect(res.status).toBe(200)
// 			expect(res.body.body.bio).toBeNull()
// 		})

// 		it('should return 409 when user already has an artist profile', async () => {
// 			await artistRepository.create(Artist.create({ bio: 'Existing bio', user: dummyUser }))

// 			const res = await request(server.app).post('/become-artist').send({})

// 			expect(res.status).toBe(409)
// 			expect(res.body.message).toBe('User already has an artist profile')
// 		})
// 	})

// 	describe('with unverified email', () => {
// 		let dummyUser: User
// 		let artistRole: Role
// 		let authMiddlewareMock: any

// 		beforeEach(() => {
// 			server = createTestServer()
// 			dummyUser = User.create(
// 				'Jane Doe',
// 				'jane@example.com',
// 				'Valid@123',
// 				new Date('1990-01-01'),
// 			)
// 			userRepository = new UserRepositoryMemory([dummyUser])
// 			artistRole = Role.create(Role.PredefinedRoles.ARTIST, 'Artist role')
// 			roleRepository = new RoleRepositoryMemory([artistRole])
// 			artistRepository = new ArtistRepositoryMemory()
// 			userRoleRepository = new UserRoleRepositoryMemory()

// 			authMiddlewareMock = {
// 				handle: () => {
// 					return (req: any, _res: any, next: any) => {
// 						req.user = { userId: dummyUser.id }
// 						next()
// 					}
// 				},
// 			}

// 			buildController(authMiddlewareMock)
// 			server.registerErrorHandler()
// 		})

// 		it('should return 401 when email is not verified', async () => {
// 			const res = await request(server.app).post('/become-artist').send({ bio: 'My bio' })

// 			expect(res.status).toBe(401)
// 		})
// 	})

// 	describe('without auth', () => {
// 		let authMiddlewareMock: any

// 		beforeEach(() => {
// 			server = createTestServer()
// 			userRepository = new UserRepositoryMemory()
// 			roleRepository = new RoleRepositoryMemory()
// 			artistRepository = new ArtistRepositoryMemory()
// 			userRoleRepository = new UserRoleRepositoryMemory()

// 			authMiddlewareMock = {
// 				handle: () => {
// 					return (_req: any, _res: any, next: any) => {
// 						next(new InvalidTokenError())
// 					}
// 				},
// 			}

// 			buildController(authMiddlewareMock)
// 			server.registerErrorHandler()
// 		})

// 		it('should return 401 when no valid token is provided', async () => {
// 			const res = await request(server.app).post('/become-artist').send({})

// 			expect(res.status).toBe(401)
// 		})
// 	})
// })

// let authMiddlewareMock: any
// describe('ArtistController', () => {
// 	let dummyUsers: User[]
// 	let dummyArtists: Artist[]
// 	beforeEach(() => {
// 		server = createTestServer()
// 		dummyUsers = []
// 		dummyArtists = []
// 		for (let i = 1; i <= 30; i++) {
// 			const dummyUser = createDummyUser({
// 				name: `User ${i}`,
// 				email: `foo${i}@bar.com`,
// 			})
// 			dummyUsers.push(dummyUser)
// 			const dummyArtist = createDummyArtist(dummyUser)
// 			dummyArtists.push(dummyArtist)
// 		}
// 		artistRepository = new ArtistRepositoryMemory(dummyArtists)
// 		userRepository = new UserRepositoryMemory(dummyUsers)
// 		updateArtistUseCase = new UpdateArtistUseCase(artistRepository, loggerPortMock)
// 		createArtistUseCase = new CreateArtistUseCase(
// 			artistRepository,
// 			userRepository,
// 			loggerPortMock,
// 		)
// 		deleteArtistUseCase = new DeleteArtistUseCase(artistRepository)
// 		authMiddlewareMock = {
// 			handle: () => {
// 				return (req: any, _res: any, next: any) => {
// 					req.user = { userId: dummyUsers[0]!.id }
// 					next()
// 				}
// 			},
// 		}
// 		new ArtistController(
// 			server,
// 			artistRepository,
// 			createArtistUseCase,
// 			updateArtistUseCase,
// 			deleteArtistUseCase,
// 			null as any,
// 			authMiddlewareMock,
// 		)
// 		server.registerErrorHandler()
// 	})
// 	describe('GET /artists', () => {
// 		it('should return 200 on success querying artists with limit and page', async () => {
// 			const res = await request(server.app).get('/artists?limit=15&page=1')
// 			expect(res.status).toBe(200)
// 			expect(res.body.data).toHaveLength(15)
// 			expect(res.body.data[0]).toEqual({
// 				id: dummyArtists[0]!.id,
// 				bio: dummyArtists[0]!.bio,
// 				userId: dummyArtists[0]!.userId,
// 				user: {
// 					name: dummyUsers[0]!.name,
// 				},
// 			})
// 		})
// 		it('should return 200 on success querying artists with a search query', async () => {
// 			const res = await request(server.app).get('/artists?limit=15&page=1&query=User 1')
// 			expect(res.status).toBe(200)
// 			expect(res.body.data).toHaveLength(11)
// 			expect(res.body.data[0]).toEqual({
// 				id: dummyArtists[0]!.id,
// 				bio: dummyArtists[0]!.bio,
// 				userId: dummyArtists[0]!.userId,
// 				user: {
// 					name: dummyUsers[0]!.name,
// 				},
// 			})
// 		})
// 	})
// 	describe('GET /artists/:artistId', () => {
// 		it('should return 200 on success querying an artist by id', async () => {
// 			const res = await request(server.app).get(`/artists/${dummyArtists[0]!.id}`)
// 			expect(res.status).toBe(200)
// 			expect(res.body).toEqual({
// 				data: {
// 					id: dummyArtists[0]!.id,
// 					bio: dummyArtists[0]!.bio,
// 					userId: dummyArtists[0]!.userId,
// 					user: {
// 						name: dummyUsers[0]!.name,
// 					},
// 				},
// 			})
// 		})
// 		it('should return 404 when artist is not found', async () => {
// 			const res = await request(server.app).get('/artists/non-existent-id')
// 			expect(res.status).toBe(404)
// 			expect(res.body).toEqual({
// 				message: 'Artist not found',
// 			})
// 		})
// 	})
// 	describe('POST /artists', () => {
// 		let dummyUser: User
// 		beforeEach(() => {
// 			dummyUser = createDummyUser()
// 			userRepository.create(dummyUser)
// 		})
// 		it('should return 201 on success creating an artist', async () => {
// 			const input = {
// 				userId: dummyUser.id,
// 				bio: 'This is a test bio',
// 			}
// 			const res = await request(server.app).post('/artists').send(input)
// 			expect(res.status).toBe(201)
// 			expect(res.body).toEqual({
// 				data: {
// 					id: expect.any(String),
// 					userId: input.userId,
// 					bio: input.bio,
// 					user: {
// 						name: dummyUser.name,
// 					},
// 				},
// 			})
// 		})

// 		it('should return 404 when trying to create an artist for a non-existent user', async () => {
// 			const input = {
// 				userId: 'non-existent-id',
// 				bio: 'This is a test bio',
// 			}
// 			const res = await request(server.app).post('/artists').send(input)
// 			expect(res.status).toBe(404)
// 			expect(res.body).toEqual({
// 				message: 'User not found',
// 			})
// 		})

// 		it('should return 409 when trying to create an artist for a user that is already an artist', async () => {
// 			const existingArtist = createDummyArtist(dummyUser)
// 			artistRepository.create(existingArtist)

// 			const input = {
// 				userId: dummyUser.id,
// 				bio: 'This is a test bio',
// 			}
// 			const res = await request(server.app).post('/artists').send(input)
// 			expect(res.status).toBe(409)
// 			expect(res.body).toEqual({
// 				message: 'This user is already an artist',
// 			})
// 		})

// 		it('should return 400 when trying to create an artist with invalid input', async () => {
// 			const cases = [
// 				{
// 					input: { userId: null, bio: 'Valid bio' },
// 					field: 'userId',
// 					message: 'User ID must be a string',
// 				},
// 				{
// 					input: { userId: dummyUser.id, bio: 123 },
// 					field: 'bio',
// 					message: 'Bio must be a string or null',
// 				},
// 				{
// 					input: { userId: dummyUser.id, bio: 'a'.repeat(2001) },
// 					field: 'bio',
// 					message: 'Bio must contain at most 2000 character(s)',
// 				},
// 			]

// 			for (const { input, field, message } of cases) {
// 				const res = await request(server.app).post('/artists').send(input)

// 				expect(res.status).toBe(400)
// 				expect(res.body.message).toBe('Invalid input')
// 				expect(Array.isArray(res.body.errors)).toBe(true)
// 				expect(res.body.errors).toEqual(
// 					expect.arrayContaining([
// 						expect.objectContaining({
// 							message,
// 							path: [field],
// 						}),
// 					]),
// 				)
// 			}
// 		})
// 	})
// 	describe('PATCH /artists/:artistId', () => {
// 		let dummyUser: User
// 		let dummyArtist: Artist
// 		beforeEach(() => {
// 			dummyUser = createDummyUser()
// 			userRepository.create(dummyUser)
// 			dummyArtist = createDummyArtist(dummyUser)
// 			artistRepository.create(dummyArtist)
// 		})
// 		it('should return 200 on success updating an artist', async () => {
// 			expect(dummyArtist.bio).toBe('Dummy Bio')
// 			const input = {
// 				bio: 'Updated bio',
// 			}
// 			const res = await request(server.app).patch(`/artists/${dummyArtist.id}`).send(input)
// 			expect(res.status).toBe(200)
// 			expect(res.body).toEqual({
// 				data: {
// 					id: dummyArtist.id,
// 					bio: dummyArtist.bio,
// 					userId: dummyArtist.userId,
// 					user: {
// 						name: dummyUser.name,
// 					},
// 				},
// 			})
// 		})

// 		it('should return 404 when trying to update a non-existent artist', async () => {
// 			const input = {
// 				bio: 'Updated bio',
// 			}
// 			const res = await request(server.app).patch('/artists/non-existent-id').send(input)
// 			expect(res.status).toBe(404)
// 			expect(res.body).toEqual({
// 				message: 'Artist not found',
// 			})
// 		})
// 		it('should return 400 when trying to update an artist with invalid input', async () => {
// 			const cases = [
// 				{
// 					input: { bio: 123 },
// 					field: 'bio',
// 					message: 'Bio must be a string or null',
// 				},
// 				{
// 					input: { bio: 'a'.repeat(2001) },
// 					field: 'bio',
// 					message: 'Bio must contain at most 2000 character(s)',
// 				},
// 			]

// 			for (const { input, field, message } of cases) {
// 				const res = await request(server.app)
// 					.patch(`/artists/${dummyArtist.id}`)
// 					.send(input)

// 				expect(res.status).toBe(400)
// 				expect(res.body.message).toBe('Invalid input')
// 				expect(Array.isArray(res.body.errors)).toBe(true)
// 				expect(res.body.errors).toEqual(
// 					expect.arrayContaining([
// 						expect.objectContaining({
// 							message,
// 							path: [field],
// 						}),
// 					]),
// 				)
// 			}
// 		})
// 	})

// 	describe('DELETE /artists/:artistId', () => {
// 		let dummyUser: User
// 		let dummyArtist: Artist
// 		beforeEach(() => {
// 			dummyUser = createDummyUser()
// 			userRepository.create(dummyUser)
// 			dummyArtist = createDummyArtist(dummyUser)
// 			artistRepository.create(dummyArtist)
// 		})
// 		it('should return 200 on success deleting an artist', async () => {
// 			const res = await request(server.app).delete(`/artists/${dummyArtist.id}`)
// 			expect(res.status).toBe(200)
// 			expect(res.body).toEqual({
// 				data: {
// 					id: dummyArtist.id,
// 					bio: dummyArtist.bio,
// 					userId: dummyArtist.userId,
// 					user: {
// 						name: dummyUser.name,
// 					},
// 				},
// 			})
// 		})

// 		it('should return 404 when trying to delete a non-existent artist', async () => {
// 			const res = await request(server.app).delete('/artists/non-existent-id')
// 			expect(res.status).toBe(404)
// 			expect(res.body).toEqual({
// 				message: 'Artist not found',
// 			})
// 		})
// 	})
// })
