import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import Operation from '#domain/rbac/operation/Operation.js'
import { PrismaClient } from '#prisma/client'
import OperationRepositoryPrismaORM from '#infra/repository/rbac/OperationRepositoryPrismaORM.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('OperationRepositoryPrismaORM', () => {
	const permissionRepository = new OperationRepositoryPrismaORM(prisma)

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Operation" RESTART IDENTITY CASCADE')
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should create a new operation', async () => {
		const operationToBeCreated = Operation.create('TEST', 'Foo bar')
		const createdOperation = await permissionRepository.create(operationToBeCreated)
		const foundOperation = await permissionRepository.findOperationById(createdOperation.id)
		expect(foundOperation!.id).toBe(createdOperation.id)
		expect(foundOperation!.name.value).toBe(createdOperation.name.value)
		expect(foundOperation!.description).toBe(createdOperation.description)
	})

	it('should list all operations', async () => {
		const operationCreated1 = await permissionRepository.create(
			Operation.create('TEST1', 'Foo bar'),
		)
		const operationCreated2 = await permissionRepository.create(
			Operation.create('TEST2', 'Foo bar'),
		)
		const foundOperations = await permissionRepository.listOperations()
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
		const foundOperation = await permissionRepository.findOperationById(crypto.randomUUID())
		expect(foundOperation).toBeNull()
	})

	it('should update an existing operation', async () => {
		const operationToBeCreated = Operation.create('TEST', 'Foo bar')
		const createdOperation = await permissionRepository.create(operationToBeCreated)
		createdOperation.updateData({
			name: 'UPDATED_TEST',
			description: 'Updated description',
		})
		const updatedOperation = await permissionRepository.update(createdOperation)
		expect(updatedOperation).not.toBeNull()
		expect(updatedOperation!.id).toBe(createdOperation.id)
		expect(updatedOperation!.name.value).toBe('UPDATED_TEST')
		expect(updatedOperation!.description).toBe('Updated description')
	})

	it("should return null when trying to update an operation that doesn't exist", async () => {
		const operationToBeUpdated = Operation.create('NON_EXISTENT', 'Foo bar')
		const updatedOperation = await permissionRepository.update(operationToBeUpdated)
		expect(updatedOperation).toBeNull()
	})

	it('should delete an existing operation', async () => {
		const operationToBeCreated = Operation.create('TEST', 'Foo bar')
		const operationCreated = await permissionRepository.create(operationToBeCreated)
		const deletedOperation = await permissionRepository.deleteOperation(operationCreated.id)
		expect(deletedOperation).not.toBeNull()
		expect(deletedOperation!.id).toBe(operationCreated.id)
		expect(deletedOperation!.name.value).toBe('TEST')
		expect(deletedOperation!.description).toBe('Foo bar')
		const operation = await permissionRepository.findOperationById(deletedOperation!.id)
		expect(operation).toBeNull()
	})

	it("should return null when trying to delete an operation that doesn't exist", async () => {
		const deletedOperation = await permissionRepository.deleteOperation(crypto.randomUUID())
		expect(deletedOperation).toBeNull()
	})
})
