import { createDummyResource } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import UpdateResourceUseCase from '#application/useCases/rbac/UpdateResourceUseCase.js'
import ResourceRepositoryMemory from '#infra/repository/rbac/ResourceRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let updateResourceUseCase: UpdateResourceUseCase
let resourceRepository: ResourceRepository

describe('UpdateResourceUseCase', () => {
	beforeEach(() => {
		resourceRepository = new ResourceRepositoryMemory()
		updateResourceUseCase = new UpdateResourceUseCase(resourceRepository, loggerPortMock)
	})

	it('should update an existing resource', async () => {
		const dummyRes = createDummyResource({ name: 'OLD' })
		await resourceRepository.create(dummyRes)
		const input = { nameResourceToUpdate: 'OLD', name: 'UPDATED' }
		const result = await updateResourceUseCase.execute(input)
		expect(result.name).toBe('UPDATED')
	})

	it('should throw if resource does not exist', async () => {
		const input = { nameResourceToUpdate: 'NONEXISTENT', name: 'WHATEVER' }
		await expect(updateResourceUseCase.execute(input)).rejects.toThrow('Resource not found')
	})

	it('should throw if the new name is already taken by another resource', async () => {
		const res1 = createDummyResource({ name: 'RES1' })
		const res2 = createDummyResource({ name: 'RES2' })
		await resourceRepository.create(res1)
		await resourceRepository.create(res2)
		const input = { nameResourceToUpdate: 'RES1', name: 'RES2' }
		await expect(updateResourceUseCase.execute(input)).rejects.toThrow(
			'Resource with the same name already exists',
		)
	})
})
