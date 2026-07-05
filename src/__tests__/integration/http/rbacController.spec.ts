import { createDummyOperation, createDummyResource } from '#__tests__/factories/RbacFactory.js'
import { createTestServer } from '#__tests__/testServer.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import CreateOperationUseCase from '#application/useCases/rbac/CreateOperationUseCase.js'
import RBACController from '#infra/controllers/RBACController.js'
import OperationRepositoryMemory from '#infra/repository/rbac/OperationRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type ExpressAdapter from '#infra/http/ExpressAdapter.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import UpdateOperationUseCase from '#application/useCases/rbac/UpdateOperationUseCase.js'
import DeleteOperationUseCase from '#application/useCases/rbac/DeleteOperationUseCase.js'
import CreateResourceUseCase from '#application/useCases/rbac/CreateResourceUseCase.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import ResourceRepositoryMemory from '#infra/repository/rbac/ResourceRepositoryMemory.js'
import UpdateResourceUseCase from '#application/useCases/rbac/UpdateResourceUseCase.js'
import DeleteResourceUseCase from '#application/useCases/rbac/DeleteResourceUseCase.js'
import CreatePermissionUseCase from '#application/useCases/rbac/CreatePermissionUseCase.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import PermissionRepositoryMemory from '#infra/repository/rbac/PermissionRepositoryMemory.js'
import DeletePermissionUseCase from '#application/useCases/rbac/DeletePermissionUseCase.js'
import CreateRoleUseCase from '#application/useCases/rbac/CreateRoleUseCase.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UpdateRoleUseCase from '#application/useCases/rbac/UpdateRoleUseCase.js'
import DeleteRoleUseCase from '#application/useCases/rbac/DeleteRoleUseCase.js'
import GrantPermissionToRoleUseCase from '#application/useCases/rbac/GrantPermissionToRoleUseCase.js'
import RevokePermissionFromRoleUseCase from '#application/useCases/rbac/RevokePermissionFromRoleUseCase.js'

const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000000'

let createOperationUseCase: CreateOperationUseCase
let updateOperationUseCase: UpdateOperationUseCase
let deleteOperationUseCase: DeleteOperationUseCase
let createResourceUseCase: CreateResourceUseCase
let updateResourceUseCase: UpdateResourceUseCase
let deleteResourceUseCase: DeleteResourceUseCase
let createPermissionUseCase: CreatePermissionUseCase
let deletePermissionUseCase: DeletePermissionUseCase
let createRoleUseCase: CreateRoleUseCase
let updateRoleUseCase: UpdateRoleUseCase
let deleteRoleUseCase: DeleteRoleUseCase
let grantPermissionToRoleUseCase: GrantPermissionToRoleUseCase
let revokePermissionFromRoleUseCase: RevokePermissionFromRoleUseCase
let server: ExpressAdapter
let operationRepository: OperationRepository
let resourceRepository: ResourceRepository
let permissionRepository: PermissionRepository
let roleRepository: RoleRepository

describe('RBACController', () => {
	describe('operations', () => {
		beforeEach(() => {
			server = createTestServer()
			operationRepository = new OperationRepositoryMemory()
			createOperationUseCase = new CreateOperationUseCase(operationRepository, loggerPortMock)
			updateOperationUseCase = new UpdateOperationUseCase(operationRepository, loggerPortMock)
			deleteOperationUseCase = new DeleteOperationUseCase(operationRepository, loggerPortMock)
			new RBACController(
				server,
				createOperationUseCase,
				updateOperationUseCase,
				deleteOperationUseCase,
				operationRepository,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		describe('POST /rbac/operations', () => {
			it('should return 204 on success', async () => {
				const res = await request(server.app).post('/rbac/operations').send({
					name: 'TEST',
					description: 'Foo bar',
				})
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						message: 'Operation created successfully',
					},
				})
			})

			it('should return 400 if name is missing', async () => {
				const res = await request(server.app).post('/rbac/operations').send({
					description: 'Foo bar',
				})
				expect(res.status).toBe(400)
				expect(res.body).toEqual({
					error: 'Validation error',
					details: [
						{
							message: 'Name is required',
						},
					],
				})
			})

			it('should return 409 if operation with the same name already exists', async () => {
				await request(server.app).post('/rbac/operations').send({
					name: 'TEST',
					description: 'Foo bar',
				})
				const res = await request(server.app).post('/rbac/operations').send({
					name: 'TEST',
					description: 'Foo bar',
				})
				expect(res.status).toBe(409)
				expect(res.body).toEqual({
					message: 'Operation with name TEST already exists',
				})
			})
		})
		describe('GET /rbac/operations', () => {
			it('should return 200 and list of operations', async () => {
				await request(server.app).post('/rbac/operations').send({
					name: 'TEST',
					description: 'Foo bar',
				})
				const res = await request(server.app).get('/rbac/operations')
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: [
						{
							id: expect.any(String),
							name: 'TEST',
							description: 'Foo bar',
						},
					],
				})
			})
		})
		describe('GET /rbac/operations/:operationName', () => {
			it('should return 200 and the operation if it exists', async () => {
				await request(server.app).post('/rbac/operations').send({
					name: 'TEST',
					description: 'Foo bar',
				})
				const res = await request(server.app).get(`/rbac/operations/TEST`)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						id: expect.any(String),
						name: 'TEST',
						description: 'Foo bar',
					},
				})
			})

			it("should return 404 if the operation doesn't exist", async () => {
				const res = await request(server.app).get(`/rbac/operations/${NON_EXISTENT_UUID}`)
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Operation not found',
				})
			})
		})

		describe('PUT /rbac/operations/:operationName', () => {
			it('should return 200 on successful update', async () => {
				await request(server.app).post('/rbac/operations').send({
					name: 'TEST',
					description: 'Foo bar',
				})
				const res = await request(server.app).put(`/rbac/operations/TEST`).send({
					name: 'UPDATED_TEST',
					description: 'Updated description',
				})
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						message: 'Operation updated successfully',
					},
				})
			})

			it("should return 404 if the operation doesn't exist", async () => {
				const res = await request(server.app)
					.put(`/rbac/operations/${NON_EXISTENT_UUID}`)
					.send({
						name: 'UPDATED_TEST',
						description: 'Updated description',
					})
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Operation not found',
				})
			})
		})
		describe('DELETE /rbac/operations/:operationName', () => {
			it('should return 200 on successful deletion', async () => {
				await request(server.app).post('/rbac/operations').send({
					name: 'TEST',
					description: 'Foo bar',
				})
				const res = await request(server.app).delete(`/rbac/operations/TEST`)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						message: 'Operation deleted successfully',
					},
				})
			})
			it("should return 404 if the operation doesn't exist", async () => {
				const res = await request(server.app).delete(
					`/rbac/operations/${NON_EXISTENT_UUID}`,
				)
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Operation not found',
				})
			})
		})
	})
	describe('resources', () => {
		beforeEach(() => {
			server = createTestServer()
			resourceRepository = new ResourceRepositoryMemory()
			createResourceUseCase = new CreateResourceUseCase(resourceRepository, loggerPortMock)
			updateResourceUseCase = new UpdateResourceUseCase(resourceRepository, loggerPortMock)
			deleteResourceUseCase = new DeleteResourceUseCase(resourceRepository, loggerPortMock)
			new RBACController(
				server,
				null as any,
				null as any,
				null as any,
				null as any,
				resourceRepository,
				createResourceUseCase,
				updateResourceUseCase,
				deleteResourceUseCase,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		describe('POST /rbac/resources', () => {
			it("should return 200 and the created resource's data on success", async () => {
				const res = await request(server.app).post('/rbac/resources').send({
					name: 'TEST',
				})
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						message: 'Resource created successfully',
						data: {
							id: expect.any(String),
							name: 'TEST',
						},
					},
				})
			})
			it('should return 409 if a resource with the same name already exists', async () => {
				await request(server.app).post('/rbac/resources').send({
					name: 'TEST',
				})
				const res = await request(server.app).post('/rbac/resources').send({
					name: 'TEST',
				})
				expect(res.status).toBe(409)
				expect(res.body).toEqual({
					message: 'Resource with the same name already exists',
				})
			})
			it('should return 400 if the name is missing', async () => {
				const res = await request(server.app).post('/rbac/resources').send({})
				expect(res.status).toBe(400)
				expect(res.body).toEqual({
					error: 'Validation error',
					details: [
						{
							message: 'Name is required',
						},
					],
				})
			})
		})
		describe('GET /rbac/resources', () => {
			it('should return 200 and list of resources', async () => {
				await request(server.app).post('/rbac/resources').send({
					name: 'TEST',
				})
				const res = await request(server.app).get('/rbac/resources')
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: [
						{
							id: expect.any(String),
							name: 'TEST',
						},
					],
				})
			})
		})
		describe('GET /rbac/resources/:resourceName', () => {
			it('should return 200 and the resource if it exists', async () => {
				await request(server.app).post('/rbac/resources').send({
					name: 'TEST',
				})
				const res = await request(server.app).get(`/rbac/resources/TEST`)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						id: expect.any(String),
						name: 'TEST',
					},
				})
			})

			it("should return 404 if the resource doesn't exist", async () => {
				const res = await request(server.app).get(`/rbac/resources/${NON_EXISTENT_UUID}`)
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Resource not found',
				})
			})
		})
		describe('PUT /rbac/resources/:resourceName', () => {
			it('should return 200 on successful update', async () => {
				await request(server.app).post('/rbac/resources').send({
					name: 'TEST',
				})
				const res = await request(server.app).put(`/rbac/resources/TEST`).send({
					name: 'UPDATED_TEST',
				})
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						message: 'Resource updated successfully',
						data: {
							id: expect.any(String),
							name: 'UPDATED_TEST',
						},
					},
				})
			})
			it("should return 404 if the resource doesn't exist", async () => {
				const res = await request(server.app)
					.put(`/rbac/resources/${NON_EXISTENT_UUID}`)
					.send({
						name: 'UPDATED_TEST',
					})
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Resource not found',
				})
			})
			it('should return 409 if the new name is already taken by another resource', async () => {
				await request(server.app).post('/rbac/resources').send({
					name: 'TEST1',
				})
				await request(server.app).post('/rbac/resources').send({
					name: 'TEST2',
				})
				const res = await request(server.app).put(`/rbac/resources/TEST1`).send({
					name: 'TEST2',
				})
				expect(res.status).toBe(409)
				expect(res.body).toEqual({
					message: 'Resource with the same name already exists',
				})
			})
		})
		describe('DELETE /rbac/resources/:resourceName', () => {
			it('should return 200 on successful deletion', async () => {
				await request(server.app).post('/rbac/resources').send({
					name: 'TEST',
				})
				const res = await request(server.app).delete(`/rbac/resources/TEST`)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						message: 'Resource deleted successfully',
						data: {
							id: expect.any(String),
							name: 'TEST',
						},
					},
				})
			})
		})
	})
	describe('permissions', () => {
		let dummyOperation: import('#domain/rbac/operation/Operation.js').default
		let dummyResource: import('#domain/rbac/resource/Resource.js').default
		beforeEach(() => {
			server = createTestServer()
			permissionRepository = new PermissionRepositoryMemory()
			dummyOperation = createDummyOperation({ name: 'TEST_OPERATION', description: 'Test operation description' })
			dummyResource = createDummyResource({ name: 'TEST_RESOURCE' })
			operationRepository = new OperationRepositoryMemory([dummyOperation])
			resourceRepository = new ResourceRepositoryMemory([dummyResource])
			createPermissionUseCase = new CreatePermissionUseCase(
				permissionRepository,
				operationRepository,
				resourceRepository,
				loggerPortMock,
			)
			deletePermissionUseCase = new DeletePermissionUseCase(
				permissionRepository,
				loggerPortMock,
			)
			new RBACController(
				server,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				createPermissionUseCase,
				deletePermissionUseCase,
				permissionRepository,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
			)
			server.registerErrorHandler()
		})
		describe('POST /rbac/permissions', () => {
			it('should return 200 and the created permission on success', async () => {
				const res = await request(server.app).post('/rbac/permissions').send({
					operationId: dummyOperation.id,
					resourceId: dummyResource.id,
				})
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					message: 'Permission created successfully',
					data: {
						id: expect.any(String),
						resource: {
							id: dummyResource.id,
							name: dummyResource.name.value,
						},
						permission: {
							id: dummyOperation.id,
							name: dummyOperation.name.value,
						},
						label: `${dummyOperation.name.value}:${dummyResource.name.value}`,
					},
				})
			})
		})
		describe('DELETE /rbac/permissions/:permissionId', () => {
			it('should return 200 and the deleted permission on success', async () => {
				const createdPermissionResponse = await request(server.app)
					.post('/rbac/permissions')
					.send({
						operationId: dummyOperation.id,
						resourceId: dummyResource.id,
					})
				const deletedPermissionResponse = await request(server.app).delete(
					`/rbac/permissions/${createdPermissionResponse.body.data.id}`,
				)
				expect(deletedPermissionResponse.status).toBe(200)
				expect(deletedPermissionResponse.body).toEqual({
					message: 'Permission deleted successfully',
					data: {
						id: expect.any(String),
						resource: {
							id: dummyResource.id,
							name: dummyResource.name.value,
						},
						permission: {
							id: dummyOperation.id,
							name: dummyOperation.name.value,
						},
						label: `${dummyOperation.name.value}:${dummyResource.name.value}`,
					},
				})
			})
		})
		describe('GET /rbac/permissions', () => {
			it('should return 200 and list of permissions', async () => {
				await request(server.app).post('/rbac/permissions').send({
					operationId: dummyOperation.id,
					resourceId: dummyResource.id,
				})
				const res = await request(server.app).get('/rbac/permissions')
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: [
						{
							id: expect.any(String),
							operationId: dummyOperation.id,
							resourceId: dummyResource.id,
						},
					],
				})
			})
		})
		describe('GET /rbac/permissions/:permissionId', () => {
			it('should return 200 and the permission if it exists', async () => {
				const createdPermissionResponse = await request(server.app)
					.post('/rbac/permissions')
					.send({
						operationId: dummyOperation.id,
						resourceId: dummyResource.id,
					})
				const res = await request(server.app).get(
					`/rbac/permissions/${createdPermissionResponse.body.data.id}`,
				)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						id: expect.any(String),
						operationId: dummyOperation.id,
						resourceId: dummyResource.id,
					},
				})
			})
			it("should return 404 if the permission doesn't exist", async () => {
				const res = await request(server.app).get(
					`/rbac/permissions/${NON_EXISTENT_UUID}`,
				)
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Permission not found',
				})
			})
		})
	})
	describe('roles', () => {
		let dummyOperation: import('#domain/rbac/operation/Operation.js').default
		let dummyResource: import('#domain/rbac/resource/Resource.js').default
		beforeEach(() => {
			server = createTestServer()
			dummyOperation = createDummyOperation({ name: 'TEST_OPERATION', description: 'Test operation description' })
			dummyResource = createDummyResource({ name: 'TEST_RESOURCE' })
			operationRepository = new OperationRepositoryMemory([dummyOperation])
			resourceRepository = new ResourceRepositoryMemory([dummyResource])
			roleRepository = new RoleRepositoryMemory()
			permissionRepository = new PermissionRepositoryMemory()
			createPermissionUseCase = new CreatePermissionUseCase(
				permissionRepository,
				operationRepository,
				resourceRepository,
				loggerPortMock,
			)
			createRoleUseCase = new CreateRoleUseCase(roleRepository, loggerPortMock)
			updateRoleUseCase = new UpdateRoleUseCase(roleRepository, loggerPortMock)
			deleteRoleUseCase = new DeleteRoleUseCase(roleRepository, loggerPortMock)
			grantPermissionToRoleUseCase = new GrantPermissionToRoleUseCase(
				roleRepository,
				permissionRepository,
				loggerPortMock,
			)
			revokePermissionFromRoleUseCase = new RevokePermissionFromRoleUseCase(
				roleRepository,
				permissionRepository,
				loggerPortMock,
			)
			new RBACController(
				server,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				null as any,
				createPermissionUseCase,
				null as any,
				null as any,
				createRoleUseCase,
				updateRoleUseCase,
				deleteRoleUseCase,
				roleRepository,
				grantPermissionToRoleUseCase,
				revokePermissionFromRoleUseCase,
			)
			server.registerErrorHandler()
		})
		describe('POST /rbac/roles', () => {
			it('should return 200 and the created role on success', async () => {
				const res = await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE',
					description: 'Test role description',
				})
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					message: 'Role created successfully',
					data: {
						id: expect.any(String),
						name: 'TEST_ROLE',
						description: 'Test role description',
					},
				})
			})
		})
		describe('PUT /rbac/roles/:roleId', () => {
			it('should return 200 on successful update', async () => {
				const createdRoleResponse = await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE',
					description: 'Test role description',
				})
				const res = await request(server.app)
					.put(`/rbac/roles/${createdRoleResponse.body.data.id}`)
					.send({
						name: 'UPDATED_TEST_ROLE',
						description: 'Updated test role description',
					})
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					message: 'Role updated successfully',
					data: {
						id: expect.any(String),
						name: 'UPDATED_TEST_ROLE',
						description: 'Updated test role description',
					},
				})
			})
			it("should return 404 if the role doesn't exist", async () => {
				const res = await request(server.app)
					.put(`/rbac/roles/${NON_EXISTENT_UUID}`)
					.send({
						name: 'UPDATED_TEST_ROLE',
						description: 'Updated test role description',
					})
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Role not found',
				})
			})
			it('should return 409 if the new name is already taken by another role', async () => {
				const createdRole1Response = await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE_1',
					description: 'Test role 1 description',
				})
				await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE_2',
					description: 'Test role 2 description',
				})
				const res = await request(server.app)
					.put(`/rbac/roles/${createdRole1Response.body.data.id}`)
					.send({
						name: 'TEST_ROLE_2',
						description: 'Updated test role 1 description',
					})
				expect(res.status).toBe(409)
				expect(res.body).toEqual({
					message: 'Role with the same name already exists',
				})
			})
		})
		describe('DELETE /rbac/roles/:roleId', () => {
			it('should return 200 on successful deletion', async () => {
				const createdRoleResponse = await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE',
					description: 'Test role description',
				})
				const res = await request(server.app).delete(
					`/rbac/roles/${createdRoleResponse.body.data.id}`,
				)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					message: 'Role deleted successfully',
					data: {
						id: expect.any(String),
						name: 'TEST_ROLE',
						description: 'Test role description',
					},
				})
			})
			it("should return 404 if the role doesn't exist", async () => {
				const res = await request(server.app).delete(`/rbac/roles/${NON_EXISTENT_UUID}`)
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Role not found',
				})
			})
		})
		describe('GET /rbac/roles', () => {
			it('should return 200 and list of roles', async () => {
				await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE',
					description: 'Test role description',
				})
				const res = await request(server.app).get('/rbac/roles')
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: [
						{
							id: expect.any(String),
							name: 'TEST_ROLE',
							description: 'Test role description',
						},
					],
				})
			})
		})
		describe('GET /rbac/roles/:roleId', () => {
			it('should return 200 and the role if it exists', async () => {
				const createdRoleResponse = await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE',
					description: 'Test role description',
				})
				const res = await request(server.app).get(
					`/rbac/roles/${createdRoleResponse.body.data.id}`,
				)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: {
						id: expect.any(String),
						name: 'TEST_ROLE',
						description: 'Test role description',
					},
				})
			})
			it("should return 404 if the role doesn't exist", async () => {
				const res = await request(server.app).get(`/rbac/roles/${NON_EXISTENT_UUID}`)
				expect(res.status).toBe(404)
				expect(res.body).toEqual({
					message: 'Role not found',
				})
			})
		})
		describe('POST /rbac/roles/:roleId/permissions', () => {
			it('should return 200 and the granted permission on success', async () => {
				const createdPermissionResponse = await request(server.app)
					.post('/rbac/permissions')
					.send({
						operationId: dummyOperation.id,
						resourceId: dummyResource.id,
					})
				const createdRoleResponse = await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE',
					description: 'Test role description',
				})
				const res = await request(server.app)
					.post(`/rbac/roles/${createdRoleResponse.body.data.id}/permissions`)
					.send({
						permissionId: createdPermissionResponse.body.data.id,
					})
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					message: 'Permission granted to role successfully',
					data: {
						roleId: createdRoleResponse.body.data.id,
						roleName: createdRoleResponse.body.data.name,
						permission: {
							id: createdPermissionResponse.body.data.id,
							label: createdPermissionResponse.body.data.label,
						},
					},
				})
			})
		})
		describe('DELETE /rbac/roles/:roleId/permissions/:permissionId', () => {
			it('should return 200 and the revoked permission on success', async () => {
				const createdPermissionResponse = await request(server.app)
					.post('/rbac/permissions')
					.send({
						operationId: dummyOperation.id,
						resourceId: dummyResource.id,
					})
				const createdRoleResponse = await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE',
					description: 'Test role description',
				})
				await request(server.app)
					.post(`/rbac/roles/${createdRoleResponse.body.data.id}/permissions`)
					.send({
						permissionId: createdPermissionResponse.body.data.id,
					})
				const res = await request(server.app).delete(
					`/rbac/roles/${createdRoleResponse.body.data.id}/permissions/${createdPermissionResponse.body.data.id}`,
				)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					message: 'Permission revoked from role successfully',
					data: {
						roleId: createdRoleResponse.body.data.id,
						roleName: createdRoleResponse.body.data.name,
						permission: {
							id: createdPermissionResponse.body.data.id,
							label: createdPermissionResponse.body.data.label,
						},
					},
				})
			})
		})
		describe('GET /rbac/roles/:roleId/permissions', () => {
			it('should return 200 and list of permissions for the role', async () => {
				const createdPermissionResponse = await request(server.app)
					.post('/rbac/permissions')
					.send({
						operationId: dummyOperation.id,
						resourceId: dummyResource.id,
					})
				const createdRoleResponse = await request(server.app).post('/rbac/roles').send({
					name: 'TEST_ROLE',
					description: 'Test role description',
				})
				 await request(server.app)
					.post(`/rbac/roles/${createdRoleResponse.body.data.id}/permissions`)
					.send({
						permissionId: createdPermissionResponse.body.data.id,
					})
				const res = await request(server.app).get(
					`/rbac/roles/${createdRoleResponse.body.data.id}/permissions`,
				)
				expect(res.status).toBe(200)
				expect(res.body).toEqual({
					body: [
						{
							id: createdPermissionResponse.body.data.id,
							operationId: createdPermissionResponse.body.data.permission.id,
							resourceId: createdPermissionResponse.body.data.resource.id,
						},
					],
				})
			})
		})
	})
})
