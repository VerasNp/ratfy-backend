import { createDummyResource } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import DeleteResourceUseCase from '#application/useCases/rbac/DeleteResourceUseCase.js'
import ResourceRepositoryMemory from '#infra/repository/rbac/ResourceRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let deleteResourceUseCase: DeleteResourceUseCase
let resourceRepository: ResourceRepository

describe('DeleteResourceUseCase', () => {
	beforeEach(() => {
		resourceRepository = new ResourceRepositoryMemory()
		deleteResourceUseCase = new DeleteResourceUseCase(resourceRepository, loggerPortMock)
	})

	it('should delete an existing resource', async () => {
		const dummyRes = createDummyResource({ name: 'DELETE_ME' })
		await resourceRepository.create(dummyRes)
		const result = await deleteResourceUseCase.execute({ nameResourceToDelete: 'DELETE_ME' })
		expect(result.name).toBe('DELETE_ME')
		const found = await resourceRepository.findResourceByName('DELETE_ME')
		expect(found).toBeNull()
	})

	it('should throw if resource does not exist', async () => {
		await expect(
			deleteResourceUseCase.execute({ nameResourceToDelete: 'NONEXISTENT' }),
		).rejects.toThrow('Resource not found')
	})
})
