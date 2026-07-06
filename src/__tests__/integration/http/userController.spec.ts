import { createTestServer } from '#__tests__/testServer.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { mailPortMock } from '#application/ports/__mocks__/MailPortMock.js'
import { templateRendererPortMock } from '#application/ports/__mocks__/TemplateRendererPortMock.js'
import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import UpdateUserUseCase from '#application/useCases/user/UpdateUserUseCase.js'
import AssignRoleToUserUseCase from '#application/useCases/rbac/AssignRoleToUserUseCase.js'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import User from '#domain/user/User.js'
import Role from '#domain/rbac/role/Role.js'
import UserController from '#infra/controllers/UserController.js'
import RemoveRoleFromUserUseCase from '#application/useCases/rbac/RemoveRoleFromUserUseCase.js'
import Permission from '#domain/rbac/permission/Permission.js'
import Operation from '#domain/rbac/operation/Operation.js'
import Resource from '#domain/rbac/resource/Resource.js'
import UserRoleRepositoryMemory from '#infra/repository/rbac/UserRoleRepositoryMemory.js'
import type { UserRoleRepository } from '#application/ports/UserRoleRepository.js'
import SignupUseCase from '#application/useCases/user/SignupUseCase.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import { rateLimiterMock } from '#infra/http/middlewares/__mocks__/rateLimitMiddlewareMock.js'
import {
	authMiddlewareMock,
	createAuthMiddlewareMock,
} from '#infra/http/middlewares/__mocks__/authMiddlewareMock.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import UniqueConstraintError from '#domain/errors/UniqueConstraintError.js'
import GetAccountUseCase from '#application/useCases/user/GetAccountUseCase.js'
import { create } from 'node:domain'
import { createDummyRole } from '#__tests__/factories/RoleFactory.js'
import GetUserUseCase from '#application/useCases/user/GetUserUseCase.js'
import { hashPortMock } from '#application/ports/__mocks__/HashPortMock.js'

let assignRoleToUserUseCase: AssignRoleToUserUseCase
let removeRoleFromUserUseCase: RemoveRoleFromUserUseCase
let userRepository: UserRepositoryMemory
let roleRepository: RoleRepositoryMemory
let server: ExpressAdapter

describe('UserController', () => {
	describe('POST /user/:userId/roles/:roleId', () => {
		let dummyUser: User
		let dummyRole: Role
		let authMiddlewareMock: any
		beforeEach(() => {
			server = createTestServer()
			dummyUser = User.create('John Doe', 'foo@bar.com', 'Valid@123', new Date('1990-01-01'))
			userRepository = new UserRepositoryMemory([dummyUser])
			authMiddlewareMock = {
				handle: () => {
					return (req: any, res: any, next: any) => {
						req.user = { userId: dummyUser.id }
						next()
					}
				},
			}
			dummyRole = Role.create('Admin', 'Administrator role')
			roleRepository = new RoleRepositoryMemory([dummyRole])
			assignRoleToUserUseCase = new AssignRoleToUserUseCase(
				userRepository,
				roleRepository,
				loggerPortMock,
			)
			new UserController(
				null as any,
				server,
				null as any,
				authMiddlewareMock,
				null as any,
				null as any,
				assignRoleToUserUseCase,
				null as any,
				null as any,
				rateLimiterMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on successful role assignment', async () => {
			const res = await request(server.app).post(
				`/user/${dummyUser.id}/roles/${dummyRole.id}`,
			)
			expect(res.status).toBe(200)
			expect(res.body).toEqual({ message: 'Role assigned to user successfully' })
		})
	})
	describe('DELETE /user/:userId/roles/:roleId', () => {
		let dummyUser: User
		let dummyRole: Role
		let authMiddlewareMock: any
		beforeEach(() => {
			server = createTestServer()
			dummyUser = User.create('John Doe', 'foo@bar.com', 'Valid@123', new Date('1990-01-01'))
			userRepository = new UserRepositoryMemory([dummyUser])
			authMiddlewareMock = {
				handle: () => {
					return (req: any, res: any, next: any) => {
						req.user = { userId: dummyUser.id }
						next()
					}
				},
			}
			dummyRole = Role.create('Admin', 'Administrator role')
			roleRepository = new RoleRepositoryMemory([dummyRole])
			assignRoleToUserUseCase = new AssignRoleToUserUseCase(
				userRepository,
				roleRepository,
				loggerPortMock,
			)
			removeRoleFromUserUseCase = new RemoveRoleFromUserUseCase(
				userRepository,
				roleRepository,
				loggerPortMock,
			)
			new UserController(
				null as any,
				server,
				null as any,
				authMiddlewareMock,
				null as any,
				null as any,
				assignRoleToUserUseCase,
				removeRoleFromUserUseCase,
				null as any,
				rateLimiterMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 on successful role removal', async () => {
			await assignRoleToUserUseCase.execute(dummyUser.id, dummyRole.id)
			const res = await request(server.app).delete(
				`/user/${dummyUser.id}/roles/${dummyRole.id}`,
			)
			expect(res.status).toBe(200)
			expect(res.body).toEqual({
				message: 'Role revoked from user successfully',
			})
		})
	})
	describe('GET /user/:userId/roles', () => {
		let dummyUser: User
		let dummyRole: Role
		let authMiddlewareMock: any
		beforeEach(() => {
			server = createTestServer()
			dummyUser = User.create('John Doe', 'foo@bar.com', 'Valid@123', new Date('1990-01-01'))
			userRepository = new UserRepositoryMemory([dummyUser])
			authMiddlewareMock = {
				handle: () => {
					return (req: any, res: any, next: any) => {
						req.user = { userId: dummyUser.id }
						next()
					}
				},
			}
			dummyRole = Role.create('Admin', 'Administrator role')
			roleRepository = new RoleRepositoryMemory([dummyRole])
			assignRoleToUserUseCase = new AssignRoleToUserUseCase(
				userRepository,
				roleRepository,
				loggerPortMock,
			)
			new UserController(
				null as any,
				server,
				null as any,
				authMiddlewareMock,
				null as any,
				null as any,
				assignRoleToUserUseCase,
				null as any,
				userRepository,
				rateLimiterMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 and list of roles for the user', async () => {
			await assignRoleToUserUseCase.execute(dummyUser.id, dummyRole.id)
			const res = await request(server.app).get(`/user/${dummyUser.id}/roles`)
			expect(res.status).toBe(200)
			expect(res.body).toEqual({
				data: [{ id: dummyRole.id, name: dummyRole.name.value }],
			})
		})
	})
	describe('GET /user/:userId/permissions', () => {
		let dummyUser: User
		let dummyRole: Role
		let dummyPermission: Permission
		let dummyOperation: Operation
		let dummyResource: Resource
		let authMiddlewareMock: any
		beforeEach(() => {
			server = createTestServer()
			dummyUser = User.create('John Doe', 'foo@bar.com', 'Valid@123', new Date('1990-01-01'))
			userRepository = new UserRepositoryMemory([dummyUser])
			authMiddlewareMock = {
				handle: () => {
					return (req: any, res: any, next: any) => {
						req.user = { userId: dummyUser.id }
						next()
					}
				},
			}
			dummyRole = Role.create('Admin', 'Administrator role')
			dummyOperation = Operation.create('read', 'Read operation')
			dummyResource = Resource.create('document')
			dummyPermission = Permission.create(dummyOperation, dummyResource)
			dummyRole.assignPermission(dummyPermission)
			roleRepository = new RoleRepositoryMemory([dummyRole])
			assignRoleToUserUseCase = new AssignRoleToUserUseCase(
				userRepository,
				roleRepository,
				loggerPortMock,
			)
			new UserController(
				null as any,
				server,
				null as any,
				authMiddlewareMock,
				null as any,
				null as any,
				assignRoleToUserUseCase,
				null as any,
				userRepository,
				rateLimiterMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 and list of permissions for the user', async () => {
			await assignRoleToUserUseCase.execute(dummyUser.id, dummyRole.id)
			const res = await request(server.app).get(`/user/${dummyUser.id}/permissions`)
			expect(res.status).toBe(200)
			expect(res.body).toEqual({
				data: [{ id: dummyPermission.id, label: dummyPermission.label }],
			})
		})
	})
	describe('GET /user/:userId/can', () => {
		let dummyUser: User
		let dummyRole: Role
		let dummyPermission: Permission
		let dummyOperation: Operation
		let dummyResource: Resource
		let authMiddlewareMock: any
		beforeEach(() => {
			server = createTestServer()
			dummyUser = User.create('John Doe', 'foo@bar.com', 'Valid@123', new Date('1990-01-01'))
			userRepository = new UserRepositoryMemory([dummyUser])
			authMiddlewareMock = {
				handle: () => {
					return (req: any, res: any, next: any) => {
						req.user = { userId: dummyUser.id }
						next()
					}
				},
			}
			dummyRole = Role.create('Admin', 'Administrator role')
			dummyOperation = Operation.create('read', 'Read operation')
			dummyResource = Resource.create('document')
			dummyPermission = Permission.create(dummyOperation, dummyResource)
			dummyRole.assignPermission(dummyPermission)
			roleRepository = new RoleRepositoryMemory([dummyRole])
			assignRoleToUserUseCase = new AssignRoleToUserUseCase(
				userRepository,
				roleRepository,
				loggerPortMock,
			)
			new UserController(
				null as any,
				server,
				null as any,
				authMiddlewareMock,
				null as any,
				null as any,
				assignRoleToUserUseCase,
				null as any,
				userRepository,
				rateLimiterMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it('should return 200 and permission check result for the user', async () => {
			await assignRoleToUserUseCase.execute(dummyUser.id, dummyRole.id)
			const res = await request(server.app).get(
				`/user/${dummyUser.id}/can?operation=${dummyOperation.name.value}&resource=${dummyResource.name.value}`,
			)
			expect(res.status).toBe(200)
			expect(res.body).toEqual({ data: { can: true } })
		})
	})
	describe.only('PATCH /user/:userId', () => {
		let server: ExpressAdapter
		let userRepository: UserRepository
		let dummyUser: User
		let updateUserUseCase: UpdateUserUseCase
		beforeEach(() => {
			server = createTestServer()
			dummyUser = createDummyUser()
			userRepository = new UserRepositoryMemory([dummyUser])
			updateUserUseCase = new UpdateUserUseCase(
				userRepository,
				loggerPortMock,
				tokenPortMock,
				mailPortMock,
				templateRendererPortMock,
				'http://localhost:3000',
				hashPortMock
			)
		})
		it('should return 200 and updated user data', async () => {
			new UserController(
				null as any,
				server,
				null as any,
				createAuthMiddlewareMock(dummyUser.id),
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				rateLimiterMock,
				updateUserUseCase,
			)
			server.registerErrorHandler()
			const res = await request(server.app)
				.patch(`/user/${dummyUser.id}`)
				.send({ name: 'Updated Name' })
			expect(res.status).toBe(200)
			console.log(res.body)
			expect(res.body.data).toEqual({
				id: dummyUser.id,
				name: 'Updated Name',
				email: dummyUser.email,
				birthDate: dummyUser.birthDate,
			})
		})
		it('should return 403 when trying to update another user', async () => {
			new UserController(
				null as any,
				server,
				null as any,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				rateLimiterMock,
				updateUserUseCase,
			)
			server.registerErrorHandler()
			const otherUserId = 'other-user-id'
			const res = await request(server.app)
				.patch(`/user/${otherUserId}`)
				.send({ name: 'Hacker' })
			expect(res.status).toBe(403)
		})
		it('should return 400 when no fields are provided', async () => {
			new UserController(
				null as any,
				server,
				null as any,
				createAuthMiddlewareMock(dummyUser.id),
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				rateLimiterMock,
				updateUserUseCase,
			)
			server.registerErrorHandler()
			const res = await request(server.app).patch(`/user/${dummyUser.id}`).send({})
			expect(res.status).toBe(400)
		})
		it('should return 422 when password is invalid', async () => {
			new UserController(
				null as any,
				server,
				null as any,
				createAuthMiddlewareMock(dummyUser.id),
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				rateLimiterMock,
				updateUserUseCase,
			)
			server.registerErrorHandler()
			const res = await request(server.app)
				.patch(`/user/${dummyUser.id}`)
				.send({ password: 'weak' })
			expect(res.status).toBe(422)
			expect(res.body.message).toBe(
				'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
			)
		})
	})
	describe('POST /signup', () => {
		let server: ExpressAdapter
		let userRepository: UserRepository
		let roleRepository: RoleRepository
		let userRoleRepository: UserRoleRepository
		let signupUseCase: SignupUseCase
		beforeEach(() => {
			server = createTestServer()
			userRepository = new UserRepositoryMemory()
			roleRepository = new RoleRepositoryMemory([])
			userRoleRepository = new UserRoleRepositoryMemory([])
			signupUseCase = new SignupUseCase(
				userRepository,
				mailPortMock,
				templateRendererPortMock,
				tokenPortMock,
				'http://localhost:3000',
				loggerPortMock,
				roleRepository,
				unitOfWorkMock,
				userRoleRepository,
			)
			new UserController(
				signupUseCase,
				server,
				null as any,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				rateLimiterMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it("should return 400 if the request body doesn't match the schema", async () => {
			const input = {
				name: 'John Doe',
				email: 'invalid-email',
				password: 'Valid@123',
				birthDate: '1990-01-01',
			}
			const res = await request(server.app).post('/signup').send(input)
			expect(res.status).toBe(400)
			expect(res.body.message).toContain('Invalid input')
			expect(res.body.errors).toBeDefined()
		})
		it('should return 409 if the email is already in use', async () => {
			const dummyUser = createDummyUser({
				email: 'foo@bar.com',
			})
			await userRepository.create(dummyUser)
			const input = {
				name: 'John Doe',
				email: 'foo@bar.com',
				password: 'Valid@123',
				birthDate: '1990-01-01',
			}
			const res = await request(server.app).post('/signup').send(input)
			expect(res.status).toBe(409)
			expect(res.body.message).toBe('User with this email already exists')
		})
		it("should return 500 if the 'user' role is not set up in the system", async () => {
			const input = {
				name: 'John Doe',
				email: 'foo@bar.com',
				password: 'Valid@123',
				birthDate: '1990-01-01',
			}
			const res = await request(server.app).post('/signup').send(input)
			expect(res.status).toBe(500)
			expect(res.body.message).toBe('Internal server error')
		})
		it('should return 409 if the email is already in use due to a race condition', async () => {
			let dummyRole = Role.create('User', 'Default user role')
			await roleRepository.createRole(dummyRole)
			unitOfWorkMock.execute.mockRejectedValueOnce(
				new UniqueConstraintError('email already exists'),
			)
			const input = {
				name: 'John Doe',
				email: 'foo@bar.com',
				password: 'Valid@123',
				birthDate: new Date('1990-01-01'),
			}
			const res = await request(server.app).post('/signup').send(input)
			expect(res.status).toBe(409)
			expect(res.body.message).toBe('User with this email already exists')
		})
		it('should return 201 and create a new user successfully', async () => {
			let dummyRole = Role.create('User', 'Default user role')
			await roleRepository.createRole(dummyRole)
			const input = {
				name: 'John Doe',
				email: 'foo@bar.com',
				password: 'Valid@123',
				birthDate: new Date('1990-01-01'),
			}
			const res = await request(server.app).post('/signup').send(input)
			expect(res.status).toBe(201)
			expect(res.body.message).toBe('User created successfully')
		})
	})
	describe('GET /account', () => {
		let server: ExpressAdapter
		let dummyUser: User
		let dummyRole: Role
		let getAccountUseCase: GetAccountUseCase
		let userRepository: UserRepository
		beforeEach(() => {
			server = createTestServer() 
			dummyRole = createDummyRole()
			dummyUser = createDummyUser({ roles: [dummyRole] })
			userRepository = new UserRepositoryMemory([dummyUser])
			getAccountUseCase = new GetAccountUseCase(userRepository, loggerPortMock)
		})
		it("should return 404 if the user doesn't exist", async () => {
			new UserController(
				null as any,
				server,
				getAccountUseCase,
				authMiddlewareMock,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				rateLimiterMock,
				null as any,
			)
			server.registerErrorHandler()
			const res = await request(server.app).get('/account')
			expect(res.status).toBe(404)
			expect(res.body.message).toBe('User not found')
		})
		it("should return 200 and the user's account information if the user exists", async () => {
			new UserController(
				null as any,
				server,
				getAccountUseCase,
				createAuthMiddlewareMock(dummyUser.id),
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				rateLimiterMock,
				null as any,
			)
			const res = await request(server.app).get('/account')
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyUser.id,
				name: dummyUser.name,
				email: dummyUser.email,
				birthDate: dummyUser.birthDate.toISOString(),
				verifiedAt: dummyUser.verifiedAt,
				roles: dummyUser.roles.map((role) => ({
					id: role.id,
					name: role.name.value,
				})),
			})
		})
	})
	describe('GET /user/:userId', () => {
		let server: ExpressAdapter
		let dummyUser: User
		let dummyRole: Role
		let getUserUserCase: GetUserUseCase
		let userRepository: UserRepository
		beforeEach(() => {
			server = createTestServer()
			dummyRole = createDummyRole()
			dummyUser = createDummyUser({ roles: [dummyRole] })
			userRepository = new UserRepositoryMemory([dummyUser])
			getUserUserCase = new GetUserUseCase(userRepository, loggerPortMock)
			new UserController(
				null as any,
				server,
				null as any,
				authMiddlewareMock,
				getUserUserCase,
				null as any,
				null as any,
				null as any,
				userRepository,
				rateLimiterMock,
				null as any,
			)
			server.registerErrorHandler()
		})
		it("should return 404 if the user doesn't exist", async () => {
			const res = await request(server.app).get(`/user/non-existent-id`)
			expect(res.status).toBe(404)
			expect(res.body.message).toBe('User not found')
		})
		it("should return 200 and the user's information if the user exists", async () => {
			const res = await request(server.app).get(`/user/${dummyUser.id}`)
			expect(res.status).toBe(200)
			expect(res.body.data).toEqual({
				id: dummyUser.id,
				name: dummyUser.name,
				email: dummyUser.email,
				birthDate: dummyUser.birthDate.toISOString(),
				roles: dummyUser.roles.map((role) => ({
					id: role.id,
					name: role.name.value,
				})),
			})
		})
	})
})
