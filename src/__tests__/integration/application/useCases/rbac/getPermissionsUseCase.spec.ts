import {
	createDummyOperation,
	createDummyPermission,
	createDummyResource,
} from '#__tests__/factories/RbacFactory.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import GetPermissionsUseCase from '#application/useCases/rbac/GetPermissionsUseCase.js'
import type Operation from '#domain/rbac/operation/Operation.js'
import type Resource from '#domain/rbac/resource/Resource.js'
import OperationRepositoryMemory from '#infra/repository/rbac/OperationRepositoryMemory.js'
import PermissionRepositoryMemory from '#infra/repository/rbac/PermissionRepositoryMemory.js'
import ResourceRepositoryMemory from '#infra/repository/rbac/ResourceRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let getPermissionsUseCase: GetPermissionsUseCase
let permissionRepository: PermissionRepository
let operationRepository: OperationRepositoryMemory
let resourceRepository: ResourceRepositoryMemory
let dummyOperation: Operation
let dummyResource: Resource

describe('GetPermissionsUseCase', () => {
	beforeEach(() => {
		operationRepository = new OperationRepositoryMemory()
		resourceRepository = new ResourceRepositoryMemory()
		permissionRepository = new PermissionRepositoryMemory()
		dummyOperation = createDummyOperation({ name: 'READ' })
		dummyResource = createDummyResource({ name: 'ALBUM' })
		operationRepository.create(dummyOperation)
		resourceRepository.create(dummyResource)
		getPermissionsUseCase = new GetPermissionsUseCase(permissionRepository)
	})

	it('should return an empty array when there are no permissions', async () => {
		const result = await getPermissionsUseCase.execute()
		expect(result).toEqual([])
	})

	it('should list all permissions with correct DTO shape', async () => {
		const permission = createDummyPermission(dummyOperation, dummyResource)
		await permissionRepository.createPermission(permission)

		const result = await getPermissionsUseCase.execute()
		expect(result).toHaveLength(1)
		expect(result[0]!.id).toBe(permission.id)
		expect(result[0]!.label).toBe('READ:ALBUM')
		expect(result[0]!.operation.id).toBe(dummyOperation.id)
		expect(result[0]!.operation.name).toBe('READ')
		expect(result[0]!.resource.id).toBe(dummyResource.id)
		expect(result[0]!.resource.name).toBe('ALBUM')
	})

	it('should list multiple permissions', async () => {
		const perm1 = createDummyPermission(dummyOperation, dummyResource)
		await permissionRepository.createPermission(perm1)

		const op2 = createDummyOperation({ name: 'DELETE' })
		const res2 = createDummyResource({ name: 'TRACK' })
		operationRepository.create(op2)
		resourceRepository.create(res2)
		const perm2 = createDummyPermission(op2, res2)
		await permissionRepository.createPermission(perm2)

		const result = await getPermissionsUseCase.execute()
		expect(result).toHaveLength(2)
	})
})
