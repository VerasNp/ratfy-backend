import type { OperationRepository } from '#application/ports/OperationRepository.js'
import type Operation from '#domain/rbac/operation/Operation.js'

class OperationRepositoryMemory implements OperationRepository {
	public operations: Operation[] = []

	public constructor(initialOperations: Operation[] = []) {
		this.operations = initialOperations
	}

	public findOperationByName(operationName: string): Promise<Operation | null> {
		const foundOperation = this.operations.find(
			(operation) => operation.name.value === operationName,
		)
		if (!foundOperation) {
			return Promise.resolve(null)
		}
		return Promise.resolve(foundOperation)
	}

	public create(operation: Operation): Promise<Operation> {
		this.operations.push(operation)
		return Promise.resolve(operation)
	}

	public listOperations(): Promise<Operation[]> {
		return Promise.resolve(this.operations)
	}

	public findOperationById(operationId: string): Promise<Operation | null> {
		const foundOperation = this.operations.find((operation) => operation.id == operationId)
		if (!foundOperation) {
			return Promise.resolve(null)
		}
		return Promise.resolve(foundOperation)
	}

	public update(operationData: Operation): Promise<Operation | null> {
		const foundOperationIndex = this.operations.findIndex(
			(operation) => operation.id === operationData.id,
		)
		if (foundOperationIndex === -1) {
			return Promise.resolve(null)
		}
		this.operations[foundOperationIndex] = operationData
		return Promise.resolve(operationData)
	}

	public deleteOperation(operationId: string): Promise<Operation | null> {
		const operationToDelete = this.operations.find((operation) => operation.id === operationId)
		if (!operationToDelete) {
			return Promise.resolve(null)
		}
		this.operations = this.operations.filter((operation) => operation.id !== operationId)
		return Promise.resolve(operationToDelete)
	}
}

export default OperationRepositoryMemory
