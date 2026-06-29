import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { OperationRepository } from '#application/ports/OperationRepository.js'
import CreateOperationUseCase from '#application/useCases/rbac/CreateOperationUseCase.js'
import OperationRepositoryMemory from '#infra/repository/rbac/OperationRepositoryMemory.js'
import { beforeAll, describe, expect, it } from 'vitest'

let createOperationUseCase: CreateOperationUseCase
let operationRepository: OperationRepository

beforeAll(() => {
	operationRepository = new OperationRepositoryMemory()
	createOperationUseCase = new CreateOperationUseCase(operationRepository, loggerPortMock)
})

describe.only('CreateOperationUseCase', () => {
	it('should create a new operation', async () => {
		const input = {
			name: 'TEST',
			description: 'Foo bar',
		}
		const output = await createOperationUseCase.execute(input)
		expect(output.id).toBeDefined()
		expect(output.name).toBe(input.name)
		expect(output.description).toBe(input.description)
	})
})
