import { CreatePermissionSchema } from '#infra/http/schemas/PermissionsSchemas.js'
import { CreateRoleSchema, UpdateRoleSchema } from '#infra/http/schemas/RolesSchemas.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import type CreateOperationUseCase from '#application/useCases/rbac/CreateOperationUseCase.js'
import type CreateResourceUseCase from '#application/useCases/rbac/CreateResourceUseCase.js'
import type CreateRoleUseCase from '#application/useCases/rbac/CreateRoleUseCase.js'
import type DeleteOperationUseCase from '#application/useCases/rbac/DeleteOperationUseCase.js'
import type DeleteResourceUseCase from '#application/useCases/rbac/DeleteResourceUseCase.js'
import type UpdateOperationUseCase from '#application/useCases/rbac/UpdateOperationUseCase.js'
import type UpdateResourceUseCase from '#application/useCases/rbac/UpdateResourceUseCase.js'
import type UpdateRoleUseCase from '#application/useCases/rbac/UpdateRoleUseCase.js'
import NotFoundInfraError from '#infra/errors/NotFoundError.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import {
	CreateOperationSchema,
	UpdateOperationSchema,
} from '#infra/http/schemas/OperationSchemas.js'
import { CreateResourceSchema, UpdateResourceSchema } from '#infra/http/schemas/ResourcesSchemas.js'
import type CreatePermissionUseCase from '#application/useCases/rbac/CreatePermissionUseCase.js'
import type DeletePermissionUseCase from '#application/useCases/rbac/DeletePermissionUseCase.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type DeleteRoleUseCase from '#application/useCases/rbac/DeleteRoleUseCase.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import { GrantPermissionToRoleSchema } from '#infra/http/schemas/ManagePermissionsToRolesSchemas.js'
import type GrantPermissionToRoleUseCase from '#application/useCases/rbac/GrantPermissionToRoleUseCase.js'
import type RevokePermissionFromRoleUseCase from '#application/useCases/rbac/RevokePermissionFromRoleUseCase.js'
import type GetPermissionsUseCase from '#application/useCases/rbac/GetPermissionsUseCase.js'

class RBACController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly createOperationUseCase: CreateOperationUseCase,
		private readonly updateOperationUseCase: UpdateOperationUseCase,
		private readonly deleteOperationUseCase: DeleteOperationUseCase,
		private readonly operationRepository: OperationRepository,
		private readonly resourceRepository: ResourceRepository,
		private readonly createResourceUseCase: CreateResourceUseCase,
		private readonly updateResourceUseCase: UpdateResourceUseCase,
		private readonly deleteResourceUseCase: DeleteResourceUseCase,
		private readonly createPermissionUseCase: CreatePermissionUseCase,
		private readonly deletePermissionUseCase: DeletePermissionUseCase,
		private readonly permissionRepository: PermissionRepository,
		private readonly createRoleUseCase: CreateRoleUseCase,
		private readonly updateRoleUseCase: UpdateRoleUseCase,
		private readonly deleteRoleUseCase: DeleteRoleUseCase,
		private readonly roleRepository: RoleRepository,
		private readonly grantPermissionToRoleUseCase: GrantPermissionToRoleUseCase,
		private readonly revokePermissionFromRoleUseCase: RevokePermissionFromRoleUseCase,
		private readonly getPermissionsUseCase: GetPermissionsUseCase,
	) {
		this.httpServer.register(
			'post',
			'/rbac/operations',
			async (_params: any, body: any, _query: any) => {
				const operationBody = CreateOperationSchema.parse(body)
				await this.createOperationUseCase.execute({
					name: operationBody.name,
					description: operationBody.description ?? null,
				})
				return {
					message: 'Operation created successfully',
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/operations',
			async (_params: any, _body: any, _query: any) => {
				const foundOperations = await this.operationRepository.listOperations()
				const operations = foundOperations.map((foundOperation) => ({
					id: foundOperation.id,
					name: foundOperation.name.value,
					description: foundOperation.description,
				}))
				return {
					body: operations,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/operations/:operationName',
			async (params: any, _body: any, _query: any) => {
				const { operationName } = params
				const foundOperation =
					await this.operationRepository.findOperationByName(operationName)
				if (!foundOperation) {
					throw new NotFoundInfraError('Operation not found')
				}
				return {
					body: {
						id: foundOperation.id,
						name: foundOperation.name.value,
						description: foundOperation.description,
					},
				}
			},
		)

		this.httpServer.register(
			'put',
			'/rbac/operations/:operationName',
			async (params: any, body: any, _query: any) => {
				const { operationName } = params
				const operationBody = UpdateOperationSchema.parse(body)
				await this.updateOperationUseCase.execute({
					nameOperationToUpdate: operationName,
					name: operationBody.name,
					description: operationBody.description ?? null,
				})
				return {
					message: 'Operation updated successfully',
				}
			},
		)

		this.httpServer.register(
			'delete',
			'/rbac/operations/:operationName',
			async (params: any, _body: any, _query: any) => {
				const { operationName } = params
				await this.deleteOperationUseCase.execute({
					operationName,
				})
				return {
					message: 'Operation deleted successfully',
				}
			},
		)

		this.httpServer.register(
			'post',
			'/rbac/resources',
			async (_params: any, body: any, _query: any) => {
				const resourceBody = CreateResourceSchema.parse(body)
				const createdResource = await this.createResourceUseCase.execute({
					name: resourceBody.name,
				})
				return {
					message: 'Resource created successfully',
					body: createdResource,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/resources',
			async (_params: any, _body: any, _query: any) => {
				const foundResources = await this.resourceRepository.listResources()
				const resources = foundResources.map((foundResource) => ({
					id: foundResource.id,
					name: foundResource.name.value,
				}))
				return {
					body: resources,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/resources/:resourceName',
			async (params: any, _body: any, _query: any) => {
				const { resourceName } = params
				const foundResource = await this.resourceRepository.findResourceByName(resourceName)
				if (!foundResource) {
					throw new NotFoundInfraError('Resource not found')
				}
				return {
					body: {
						id: foundResource.id,
						name: foundResource.name.value,
					},
				}
			},
		)

		this.httpServer.register(
			'put',
			'/rbac/resources/:resourceName',
			async (params: any, body: any, _query: any) => {
				const { resourceName } = params
				const resourceBody = UpdateResourceSchema.parse(body)
				const updatedResource = await this.updateResourceUseCase.execute({
					nameResourceToUpdate: resourceName,
					name: resourceBody.name,
				})
				return {
					message: 'Resource updated successfully',
					body: updatedResource,
				}
			},
		)

		this.httpServer.register(
			'delete',
			'/rbac/resources/:resourceName',
			async (params: any, _body: any, _query: any) => {
				const { resourceName } = params
				const deletedResource = await this.deleteResourceUseCase.execute({
					nameResourceToDelete: resourceName,
				})
				return {
					message: 'Resource deleted successfully',
					body: deletedResource,
				}
			},
		)

		this.httpServer.register(
			'post',
			'/rbac/permissions',
			async (_params: any, body: any, _query: any) => {
				const permissionBody = CreatePermissionSchema.parse(body)
				const createdPermission = await this.createPermissionUseCase.execute({
					operationId: permissionBody.operationId,
					resourceId: permissionBody.resourceId,
				})
				return {
					message: 'Permission created successfully',
					body: createdPermission,
				}
			},
		)

		this.httpServer.register(
			'delete',
			'/rbac/permissions/:permissionId',
			async (params: any, _body: any, _query: any) => {
				const { permissionId } = params
				const deletedPermission = await this.deletePermissionUseCase.execute({
					permissionId,
				})
				return {
					message: 'Permission deleted successfully',
					body: deletedPermission,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/permissions',
			async (_params: any, _body: any, _query: any) => {
				const permissions = await this.getPermissionsUseCase.execute()
				return {
					body: permissions,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/permissions/:permissionId',
			async (params: any, _body: any, _query: any) => {
				const { permissionId } = params
				const foundPermission =
					await this.permissionRepository.findPermissionById(permissionId)
				if (!foundPermission) {
					throw new NotFoundInfraError('Permission not found')
				}
				return {
					body: {
						id: foundPermission.id,
						operationId: foundPermission.operation.id,
						resourceId: foundPermission.resource.id,
					},
				}
			},
		)

		this.httpServer.register(
			'post',
			'/rbac/roles',
			async (_params: any, body: any, _query: any) => {
				const roleBody = CreateRoleSchema.parse(body)
				const createdRole = await this.createRoleUseCase.execute({
					name: roleBody.name,
					description: roleBody.description ?? null,
				})
				return {
					message: 'Role created successfully',
					body: createdRole,
				}
			},
		)

		this.httpServer.register(
			'put',
			'/rbac/roles/:roleId',
			async (params: any, body: any, _query: any) => {
				const { roleId } = params
				const roleBody = UpdateRoleSchema.parse(body)
				const updatedRole = await this.updateRoleUseCase.execute(roleId, {
					name: roleBody.name,
					description: roleBody.description ?? null,
				})
				return {
					message: 'Role updated successfully',
					body: updatedRole,
				}
			},
		)

		this.httpServer.register(
			'delete',
			'/rbac/roles/:roleId',
			async (params: any, _body: any, _query: any) => {
				const { roleId } = params
				const deletedRole = await this.deleteRoleUseCase.execute(roleId)
				return {
					message: 'Role deleted successfully',
					body: deletedRole,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/roles',
			async (_params: any, _body: any, _query: any) => {
				const foundRoles = await this.roleRepository.listRoles()
				const roles = foundRoles.map((foundRole) => ({
					id: foundRole.id,
					name: foundRole.name.value,
					description: foundRole.description,
				}))
				return {
					body: roles,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/roles/:roleId',
			async (params: any, _body: any, _query: any) => {
				const { roleId } = params
				const foundRole = await this.roleRepository.findRoleById(roleId)
				if (!foundRole) {
					throw new NotFoundInfraError('Role not found')
				}
				return {
					body: {
						id: foundRole.id,
						name: foundRole.name.value,
						description: foundRole.description,
					},
				}
			},
		)

		this.httpServer.register(
			'post',
			'/rbac/roles/:roleId/permissions',
			async (params: any, body: any, _query: any) => {
				const { roleId } = params
				const permissionBody = GrantPermissionToRoleSchema.parse(body)
				const grantedPermission = await this.grantPermissionToRoleUseCase.execute(
					roleId,
					permissionBody.permissionId,
				)
				return {
					message: 'Permission granted to role successfully',
					body: grantedPermission,
				}
			},
		)

		this.httpServer.register(
			'delete',
			'/rbac/roles/:roleId/permissions/:permissionId',
			async (params: any, _body: any, _query: any) => {
				const { roleId, permissionId } = params
				const revokedPermission = await this.revokePermissionFromRoleUseCase.execute(
					roleId,
					permissionId,
				)
				return {
					message: 'Permission revoked from role successfully',
					body: revokedPermission,
				}
			},
		)

		this.httpServer.register(
			'get',
			'/rbac/roles/:roleId/permissions',
			async (params: any, _body: any, _query: any) => {
				const { roleId } = params
				const foundRole = await this.roleRepository.findRoleById(roleId)
				if (!foundRole) {
					throw new NotFoundInfraError('Role not found')
				}
				const permissions = foundRole.permissions.map((permission) => ({
					id: permission.id,
					operationId: permission.operation.id,
					resourceId: permission.resource.id,
				}))
				return {
					body: permissions,
				}
			},
		)
	}
}

export default RBACController
