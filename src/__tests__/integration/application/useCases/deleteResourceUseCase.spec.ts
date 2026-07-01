import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { ResourceRepository } from '#application/ports/ResourceRepository.js'
import DeleteResourceUseCase from '#application/useCases/rbac/DeleteResourceUseCase.js'
import Resource from '#domain/rbac/resource/Resource.js'
import ResourceRepositoryMemory from '#infra/repository/rbac/ResourceRepositoryMemory.js'
import { beforeAll, describe, expect, it } from 'vitest'

let deleteResourceUseCase: DeleteResourceUseCase
let resourceRepository: ResourceRepository

beforeAll(() => {
	resourceRepository = new ResourceRepositoryMemory([Resource.create('RESOURCE')])
	deleteResourceUseCase = new DeleteResourceUseCase(resourceRepository, loggerPortMock)
})

describe('DeleteResourceUseCase', () => {
	it('should delete a resource successfully', async () => {
		await deleteResourceUseCase.execute({ nameResourceToDelete: 'RESOURCE' })
		const resources = await resourceRepository.listResources()
		expect(resources).toHaveLength(0)
	})
})
