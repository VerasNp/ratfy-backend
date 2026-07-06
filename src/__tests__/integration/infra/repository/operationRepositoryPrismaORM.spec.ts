import { createDummyOperation, createDummyOperationPrismaORM } from '#__tests__/factories/RbacFactory.js'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#prisma/client'
import OperationRepositoryPrismaORM from '#infra/repository/rbac/OperationRepositoryPrismaORM.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('OperationRepositoryPrismaORM', () => {
	const operationRepository = new OperationRepositoryPrismaORM(prisma)

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Operation" RESTART IDENTITY CASCADE')
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should create a new operation', async () => {
		const operationToBeCreated = createDummyOperation({ name: 'TEST', description: 'Foo bar' })
		const createdOperation = await operationRepository.create(operationToBeCreated)
		const foundOperation = await operationRepository.findOperationById(createdOperation.id)
		expect(foundOperation!.id).toBe(createdOperation.id)
		expect(foundOperation!.name.value).toBe(createdOperation.name.value)
		expect(foundOperation!.description).toBe(createdOperation.description)
	})

	it('should list all operations', async () => {
		const operationCreated1 = await createDummyOperationPrismaORM(prisma, { name: 'TEST1', description: 'Foo bar' })
		const operationCreated2 = await createDummyOperationPrismaORM(prisma, { name: 'TEST2', description: 'Foo bar' })
		const foundOperations = await operationRepository.listOperations()
		expect(foundOperations.length).toBe(2)
		expect(foundOperations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: operationCreated1.id,
					name: operationCreated1.name
				}),
				expect.objectContaining({
					id: operationCreated2.id,
					name: operationCreated2.name
				}),
			]),
		)
	})

	it("should return null when trying to get an operation that doesn't exist", async () => {
		const foundOperation = await operationRepository.findOperationById(crypto.randomUUID())
		expect(foundOperation).toBeNull()
	})

	it('should update an existing operation', async () => {
		const createdOperation = await createDummyOperationPrismaORM(prisma, { name: 'TEST', description: 'Foo bar' })
		createdOperation.updateData({
			name: 'UPDATED_TEST',
			description: 'Updated description',
		})
		const updatedOperation = await operationRepository.update(createdOperation)
		expect(updatedOperation).not.toBeNull()
		expect(updatedOperation!.id).toBe(createdOperation.id)
		expect(updatedOperation!.name.value).toBe('UPDATED_TEST')
		expect(updatedOperation!.description).toBe('Updated description')
	})

	it("should return null when trying to update an operation that doesn't exist", async () => {
		const operationToBeUpdated = createDummyOperation({ name: 'NON_EXISTENT', description: 'Foo bar' })
		const updatedOperation = await operationRepository.update(operationToBeUpdated)
		expect(updatedOperation).toBeNull()
	})

	it('should delete an existing operation', async () => {
		const operationCreated = await createDummyOperationPrismaORM(prisma, { name: 'TEST', description: 'Foo bar' })
		const deletedOperation = await operationRepository.deleteOperation(operationCreated.id)
		expect(deletedOperation).not.toBeNull()
		expect(deletedOperation!.id).toBe(operationCreated.id)
		expect(deletedOperation!.name.value).toBe('TEST')
		expect(deletedOperation!.description).toBe('Foo bar')
		const operation = await operationRepository.findOperationById(deletedOperation!.id)
		expect(operation).toBeNull()
	})

	it("should return null when trying to delete an operation that doesn't exist", async () => {
		const deletedOperation = await operationRepository.deleteOperation(crypto.randomUUID())
		expect(deletedOperation).toBeNull()
	})
})
