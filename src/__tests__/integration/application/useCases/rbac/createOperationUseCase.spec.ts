import { createDummyOperation } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import CreateOperationUseCase from '#application/useCases/rbac/CreateOperationUseCase.js'
import OperationRepositoryMemory from '#infra/repository/rbac/OperationRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let createOperationUseCase: CreateOperationUseCase
let operationRepository: OperationRepository

describe('CreateOperationUseCase', () => {
	beforeEach(() => {
		operationRepository = new OperationRepositoryMemory()
		createOperationUseCase = new CreateOperationUseCase(operationRepository, loggerPortMock)
	})

	it('should create a new operation', async () => {
		const input = { name: 'CREATE', description: 'Create operation' }
		const result = await createOperationUseCase.execute(input)
		expect(result.id).toBeDefined()
		expect(result.name).toBe('CREATE')
		expect(result.description).toBe('Create operation')
	})

	it('should throw if operation with the same name already exists', async () => {
		await operationRepository.create(createDummyOperation({ name: 'CREATE' }))
		const input = { name: 'CREATE', description: null }
		await expect(createOperationUseCase.execute(input)).rejects.toThrow(
			'Operation with name CREATE already exists',
		)
	})
})
