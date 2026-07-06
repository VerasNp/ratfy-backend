import { createDummyOperation } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import UpdateOperationUseCase from '#application/useCases/rbac/UpdateOperationUseCase.js'
import OperationRepositoryMemory from '#infra/repository/rbac/OperationRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let updateOperationUseCase: UpdateOperationUseCase
let operationRepository: OperationRepository

describe('UpdateOperationUseCase', () => {
	beforeEach(() => {
		operationRepository = new OperationRepositoryMemory()
		updateOperationUseCase = new UpdateOperationUseCase(operationRepository, loggerPortMock)
	})

	it('should update an existing operation', async () => {
		const dummyOp = createDummyOperation({ name: 'OLD', description: 'Old desc' })
		await operationRepository.create(dummyOp)
		const input = {
			nameOperationToUpdate: 'OLD',
			name: 'UPDATED',
			description: 'Updated desc',
		}
		const result = await updateOperationUseCase.execute(input)
		expect(result.name).toBe('UPDATED')
		expect(result.description).toBe('Updated desc')
	})

	it('should throw if operation does not exist', async () => {
		const input = {
			nameOperationToUpdate: 'NONEXISTENT',
			name: 'WHATEVER',
			description: null,
		}
		await expect(updateOperationUseCase.execute(input)).rejects.toThrow('Operation not found')
	})
})
