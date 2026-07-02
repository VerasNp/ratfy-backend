import { createTestServer } from '#__tests__/testServer.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
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

let assignRoleToUserUseCase: AssignRoleToUserUseCase
let removeRoleFromUserUseCase: RemoveRoleFromUserUseCase
let userRepository: UserRepositoryMemory
let roleRepository: RoleRepositoryMemory
let server: ExpressAdapter
const rateLimiterMock = {
	handle: () => {
		return (_req: any, _res: any, next: any) => next()
	},
}

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
})
