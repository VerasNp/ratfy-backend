import { createDummyOperation } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import DeleteOperationUseCase from '#application/useCases/rbac/DeleteOperationUseCase.js'
import OperationRepositoryMemory from '#infra/repository/rbac/OperationRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let deleteOperationUseCase: DeleteOperationUseCase
let operationRepository: OperationRepository

describe('DeleteOperationUseCase', () => {
	beforeEach(() => {
		operationRepository = new OperationRepositoryMemory()
		deleteOperationUseCase = new DeleteOperationUseCase(operationRepository, loggerPortMock)
	})

	it('should delete an existing operation', async () => {
		const dummyOp = createDummyOperation({ name: 'DELETE_ME' })
		await operationRepository.create(dummyOp)
		const result = await deleteOperationUseCase.execute({ operationName: 'DELETE_ME' })
		expect(result.name).toBe('DELETE_ME')
		const found = await operationRepository.findOperationByName('DELETE_ME')
		expect(found).toBeNull()
	})

	it('should throw if operation does not exist', async () => {
		await expect(
			deleteOperationUseCase.execute({ operationName: 'NONEXISTENT' }),
		).rejects.toThrow('Operation not found')
	})
})
