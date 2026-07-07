import { createDummyOperation, createDummyPermission, createDummyResource } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import DeletePermissionUseCase from '#application/useCases/rbac/DeletePermissionUseCase.js'
import type Permission from '#domain/rbac/permission/Permission.js'
import PermissionRepositoryMemory from '#infra/repository/rbac/PermissionRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let deletePermissionUseCase: DeletePermissionUseCase
let permissionRepository: PermissionRepository

describe('DeletePermissionUseCase', () => {
	let dummyPermission: Permission
	beforeEach(() => {
		permissionRepository = new PermissionRepositoryMemory()
		const operation = createDummyOperation()
		const resource = createDummyResource()
		dummyPermission = createDummyPermission(operation, resource)
		permissionRepository.createPermission(dummyPermission)
		deletePermissionUseCase = new DeletePermissionUseCase(permissionRepository, loggerPortMock)
	})

	it('should delete an existing permission', async () => {
		const result = await deletePermissionUseCase.execute({ permissionId: dummyPermission.id })
		expect(result.id).toBe(dummyPermission.id)
		const found = await permissionRepository.findPermissionById(dummyPermission.id)
		expect(found).toBeNull()
	})

	it('should throw if permission does not exist', async () => {
		await expect(
			deletePermissionUseCase.execute({ permissionId: 'non-existent' }),
		).rejects.toThrow('Permission not found')
	})
})
