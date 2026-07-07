import type Operation from '#domain/rbac/operation/Operation.js'

export interface OperationRepository {
	/**
	 * Creates an operation
	 * @param operationData
	 */
	create(operationData: Operation): Promise<Operation>
	/**
	 * List all operations
	 */
	listOperations(): Promise<Operation[]>
	/**
	 * Get an operation by its unique identifier
	 * @param operationId The unique identifier of the operation
	 */
	findOperationById(operationId: string): Promise<Operation | null>
	/**
	 * Updates operation data
	 * @param operationData Operation data updated
	 */
	update(operationData: Operation): Promise<Operation | null>
	/**
	 * Deletes an operation
	 * @param operationId The unique identifier of the operation
	 */
	deleteOperation(operationId: string): Promise<Operation | null>
	/**
	 * Finds an operation by its name
	 * @param operationName The name of the operation
	 */
	findOperationByName(operationName: string): Promise<Operation | null>
}
