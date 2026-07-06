import { createDummyResource } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import CreateResourceUseCase from '#application/useCases/rbac/CreateResourceUseCase.js'
import ResourceRepositoryMemory from '#infra/repository/rbac/ResourceRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let createResourceUseCase: CreateResourceUseCase
let resourceRepository: ResourceRepository

describe('CreateResourceUseCase', () => {
	beforeEach(() => {
		resourceRepository = new ResourceRepositoryMemory()
		createResourceUseCase = new CreateResourceUseCase(resourceRepository, loggerPortMock)
	})

	it('should create a new resource', async () => {
		const result = await createResourceUseCase.execute({ name: 'ALBUM' })
		expect(result.id).toBeDefined()
		expect(result.name).toBe('ALBUM')
	})

	it('should throw if resource with the same name already exists', async () => {
		await resourceRepository.create(createDummyResource({ name: 'ALBUM' }))
		await expect(createResourceUseCase.execute({ name: 'ALBUM' })).rejects.toThrow(
			'Resource with the same name already exists',
		)
	})
})
