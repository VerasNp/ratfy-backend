import { createDummyOperation, createDummyResource } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import type { PermissionRepository } from '#application/ports/PermissionRepository.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import CreatePermissionUseCase from '#application/useCases/rbac/CreatePermissionUseCase.js'
import type Operation from '#domain/rbac/operation/Operation.js'
import type Resource from '#domain/rbac/resource/Resource.js'
import OperationRepositoryMemory from '#infra/repository/rbac/OperationRepositoryMemory.js'
import PermissionRepositoryMemory from '#infra/repository/rbac/PermissionRepositoryMemory.js'
import ResourceRepositoryMemory from '#infra/repository/rbac/ResourceRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let createPermissionUseCase: CreatePermissionUseCase
let permissionRepository: PermissionRepository
let operationRepository: OperationRepository
let resourceRepository: ResourceRepository
let dummyOperation: Operation
let dummyResource: Resource

describe('CreatePermissionUseCase', () => {
	beforeEach(() => {
		permissionRepository = new PermissionRepositoryMemory()
		operationRepository = new OperationRepositoryMemory()
		resourceRepository = new ResourceRepositoryMemory()
		dummyOperation = createDummyOperation({ name: 'CREATE' })
		dummyResource = createDummyResource({ name: 'ALBUM' })
		operationRepository.create(dummyOperation)
		resourceRepository.create(dummyResource)
		createPermissionUseCase = new CreatePermissionUseCase(
			permissionRepository,
			operationRepository,
			resourceRepository,
			loggerPortMock,
		)
	})

	it('should create a new permission', async () => {
		const result = await createPermissionUseCase.execute({
			operationId: dummyOperation.id,
			resourceId: dummyResource.id,
		})
		expect(result.id).toBeDefined()
		expect(result.label).toBe('CREATE:ALBUM')
	})

	it('should throw if operation is not found', async () => {
		await expect(
			createPermissionUseCase.execute({
				operationId: 'non-existent',
				resourceId: dummyResource.id,
			}),
		).rejects.toThrow('Operation not found')
	})

	it('should throw if resource is not found', async () => {
		await expect(
			createPermissionUseCase.execute({
				operationId: dummyOperation.id,
				resourceId: 'non-existent',
			}),
		).rejects.toThrow('Resource not found')
	})

	it('should throw if permission already exists', async () => {
		await createPermissionUseCase.execute({
			operationId: dummyOperation.id,
			resourceId: dummyResource.id,
		})
		await expect(
			createPermissionUseCase.execute({
				operationId: dummyOperation.id,
				resourceId: dummyResource.id,
			}),
		).rejects.toThrow('Permission already exists')
	})
})
