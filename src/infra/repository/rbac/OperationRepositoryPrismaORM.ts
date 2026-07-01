import type { OperationRepository } from '#application/ports/OperationRepository.js'
import Operation from '#domain/rbac/operation/Operation.js'
import { Prisma, PrismaClient } from '#prisma/client.js'

class OperationRepositoryPrismaORM implements OperationRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async findOperationByName(operationName: string): Promise<Operation | null> {
		const operationFound = await this.orm.operation.findUnique({
			where: {
				name: operationName,
			},
		})
		if (!operationFound) {
			return null
		}
		const operation = Operation.restore(
			operationFound.id,
			operationFound.name,
			operationFound.description,
		)
		return operation
	}

	public async create(operationData: Operation): Promise<Operation> {
		const createdOperation = await this.orm.operation.create({
			data: {
				id: operationData.id,
				name: operationData.name.value,
				description: operationData.description,
			},
		})
		const operation = Operation.restore(
			createdOperation.id,
			createdOperation.name,
			createdOperation.description,
		)
		return operation
	}

	public async listOperations(): Promise<Operation[]> {
		const operationsFound = await this.orm.operation.findMany()
		const operations = operationsFound.map((operation) =>
			Operation.restore(operation.id, operation.name, operation.description),
		)
		return operations
	}

	public async findOperationById(operationId: string): Promise<Operation | null> {
		const operationFound = await this.orm.operation.findUnique({
			where: {
				id: operationId,
			},
		})
		if (!operationFound) {
			return null
		}
		const operation = Operation.restore(
			operationFound.id,
			operationFound.name,
			operationFound.description,
		)
		return operation
	}

	public async update(operationData: Operation): Promise<Operation | null> {
		try {
			const updatedOperation = await this.orm.operation.update({
				where: {
					id: operationData.id,
				},
				data: {
					name: operationData.name.value,
					description: operationData.description,
				},
			})
			const operation = Operation.restore(
				updatedOperation.id,
				updatedOperation.name,
				updatedOperation.description,
			)
			return operation
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}

	public async deleteOperation(operationId: string): Promise<Operation | null> {
		try {
			const deletedOperation = await this.orm.operation.delete({
				where: {
					id: operationId,
				},
			})
			const operation = Operation.restore(
				deletedOperation.id,
				deletedOperation.name,
				deletedOperation.description,
			)
			return operation
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}
}

export default OperationRepositoryPrismaORM
