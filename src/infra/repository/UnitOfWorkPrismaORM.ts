import type { UnitOfWork } from '#application/ports/UnitOfWork.js'
import type { PrismaClient } from '../../../prisma/generated/prisma/client'

class UnitOfWorkPrismaORM implements UnitOfWork {
	public constructor(private readonly orm: PrismaClient) {}

	public async execute<T>(fn: () => Promise<T>): Promise<T> {
		return this.orm.$transaction(fn)
	}
}

export default UnitOfWorkPrismaORM
