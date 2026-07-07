import { createDummyResource, createDummyResourcePrismaORM } from '#__tests__/factories/RbacFactory.js'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#prisma/client'
import ResourceRepositoryPrismaORM from '#infra/repository/rbac/ResourceRepositoryPrismaORM.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('ResourceRepositoryPrismaORM', () => {
	const resourceRepository = new ResourceRepositoryPrismaORM(prisma)

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Resource" RESTART IDENTITY CASCADE')
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should create a new resource', async () => {
		const resourceToBeCreated = createDummyResource({ name: 'TEST' })
		const createdResource = await resourceRepository.create(resourceToBeCreated)
		const foundResource = await resourceRepository.findResourceById(createdResource.id)
		expect(foundResource!.id).toBe(createdResource.id)
		expect(foundResource!.name.value).toBe(createdResource.name.value)
	})

	it('should list all resources', async () => {
		const resource1 = await createDummyResourcePrismaORM(prisma, { name: 'TEST1' })
		const resource2 = await createDummyResourcePrismaORM(prisma, { name: 'TEST2' })
		const resources = await resourceRepository.listResources()
		expect(resources.length).toBe(2)
		expect(resources).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: resource1.id, name: resource1.name }),
				expect.objectContaining({ id: resource2.id, name: resource2.name }),
			]),
		)
	})

	it("should return null when trying to get a resource that doesn't exist", async () => {
		const foundResource = await resourceRepository.findResourceById(crypto.randomUUID())
		expect(foundResource).toBeNull()
	})

	it('should update an existing resource', async () => {
		const createdResource = await createDummyResourcePrismaORM(prisma, { name: 'TEST' })
		createdResource.updateData({ name: 'UPDATED_TEST' })
		const updatedResource = await resourceRepository.updateResource(createdResource)
		expect(updatedResource).not.toBeNull()
		expect(updatedResource!.id).toBe(createdResource.id)
		expect(updatedResource!.name.value).toBe('UPDATED_TEST')
	})

	it("should return null when trying to update a resource that doesn't exist", async () => {
		const resourceToBeUpdated = createDummyResource({ name: 'NON_EXISTENT' })
		const updatedResource = await resourceRepository.updateResource(resourceToBeUpdated)
		expect(updatedResource).toBeNull()
	})

	it('should delete an existing resource', async () => {
		const createdResource = await createDummyResourcePrismaORM(prisma, { name: 'TEST' })
		const deletedResource = await resourceRepository.deleteResource(createdResource.id)
		expect(deletedResource).not.toBeNull()
		expect(deletedResource!.id).toBe(createdResource.id)
		expect(deletedResource!.name.value).toBe('TEST')
		const foundResource = await resourceRepository.findResourceById(deletedResource!.id)
		expect(foundResource).toBeNull()
	})

	it("should return null when trying to delete a resource that doesn't exist", async () => {
		const deletedResource = await resourceRepository.deleteResource(crypto.randomUUID())
		expect(deletedResource).toBeNull()
	})
})
