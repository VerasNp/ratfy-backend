import { createDummyOperation, createDummyPermission, createDummyResource, createDummyRole } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import GrantPermissionToRoleUseCase from '#application/useCases/rbac/GrantPermissionToRoleUseCase.js'
import type Permission from '#domain/rbac/permission/Permission.js'
import type Role from '#domain/rbac/role/Role.js'
import PermissionRepositoryMemory from '#infra/repository/rbac/PermissionRepositoryMemory.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let grantPermissionToRoleUseCase: GrantPermissionToRoleUseCase
let roleRepository: RoleRepository
let permissionRepository: PermissionRepository
let dummyRole: Role
let dummyPermission: Permission

describe('GrantPermissionToRoleUseCase', () => {
	beforeEach(() => {
		roleRepository = new RoleRepositoryMemory()
		permissionRepository = new PermissionRepositoryMemory()
		const operation = createDummyOperation()
		const resource = createDummyResource()
		dummyRole = createDummyRole({ name: 'EDITOR' })
		dummyPermission = createDummyPermission(operation, resource)
		roleRepository.createRole(dummyRole)
		permissionRepository.createPermission(dummyPermission)
		grantPermissionToRoleUseCase = new GrantPermissionToRoleUseCase(
			roleRepository,
			permissionRepository,
			loggerPortMock,
		)
	})

	it('should grant a permission to a role', async () => {
		const result = await grantPermissionToRoleUseCase.execute(dummyRole.id, dummyPermission.id)
		expect(result.roleId).toBe(dummyRole.id)
		expect(result.roleName).toBe('EDITOR')
		expect(result.permission.id).toBe(dummyPermission.id)
		const updatedRole = await roleRepository.findRoleById(dummyRole.id)
		expect(updatedRole!.permissions).toHaveLength(1)
	})

	it('should throw if role does not exist', async () => {
		await expect(
			grantPermissionToRoleUseCase.execute('non-existent-role', dummyPermission.id),
		).rejects.toThrow('Role not found')
	})

	it('should throw if permission does not exist', async () => {
		await expect(
			grantPermissionToRoleUseCase.execute(dummyRole.id, 'non-existent-permission'),
		).rejects.toThrow('Permission not found')
	})
})
