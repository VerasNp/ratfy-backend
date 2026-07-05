import { createDummyOperation, createDummyPermission, createDummyResource, createDummyRole } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import RevokePermissionFromRoleUseCase from '#application/useCases/rbac/RevokePermissionFromRoleUseCase.js'
import type Permission from '#domain/rbac/permission/Permission.js'
import type Role from '#domain/rbac/role/Role.js'
import PermissionRepositoryMemory from '#infra/repository/rbac/PermissionRepositoryMemory.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let revokePermissionFromRoleUseCase: RevokePermissionFromRoleUseCase
let roleRepository: RoleRepository
let permissionRepository: PermissionRepository
let dummyRole: Role
let dummyPermission: Permission

describe('RevokePermissionFromRoleUseCase', () => {
	beforeEach(() => {
		roleRepository = new RoleRepositoryMemory()
		permissionRepository = new PermissionRepositoryMemory()
		const operation = createDummyOperation()
		const resource = createDummyResource()
		dummyRole = createDummyRole({ name: 'EDITOR' })
		dummyPermission = createDummyPermission(operation, resource)
		dummyRole.assignPermission(dummyPermission)
		roleRepository.createRole(dummyRole)
		permissionRepository.createPermission(dummyPermission)
		revokePermissionFromRoleUseCase = new RevokePermissionFromRoleUseCase(
			roleRepository,
			permissionRepository,
			loggerPortMock,
		)
	})

	it('should revoke a permission from a role', async () => {
		const result = await revokePermissionFromRoleUseCase.execute(dummyRole.id, dummyPermission.id)
		expect(result.roleId).toBe(dummyRole.id)
		const updatedRole = await roleRepository.findRoleById(dummyRole.id)
		expect(updatedRole!.permissions).toHaveLength(0)
	})

	it('should throw if role does not exist', async () => {
		await expect(
			revokePermissionFromRoleUseCase.execute('non-existent-role', dummyPermission.id),
		).rejects.toThrow('Role not found')
	})

	it('should throw if permission does not exist', async () => {
		await expect(
			revokePermissionFromRoleUseCase.execute(dummyRole.id, 'non-existent-permission'),
		).rejects.toThrow('Permission not found')
	})
})
