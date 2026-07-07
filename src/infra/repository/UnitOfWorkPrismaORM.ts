import type { TransactionHandle } from '#application/ports/TransactionHandle.js'
import type { UnitOfWork } from '#application/ports/UnitOfWork.js'
import type { PrismaClient } from '../../../prisma/generated/prisma/client'

class UnitOfWorkPrismaORM implements UnitOfWork {
	public constructor(private readonly orm: PrismaClient) {}

	public async execute<T>(fn: (tx: TransactionHandle) => Promise<T>): Promise<T> {
		return this.orm.$transaction(async (prismaTx) => {
			return fn(prismaTx as unknown as TransactionHandle)
		})
	}
}

export default UnitOfWorkPrismaORM
