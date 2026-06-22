import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../../prisma/generated/prisma/client'
import ResourceRepositoryPrismaORM from '#infra/repository/ResourceRepositoryPrismaORM.js'
import Resource from '#domain/rbac/resource/Resource.js'

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
		const resourceToBeCreated = Resource.create('TEST')
		const createdResource = await resourceRepository.create(resourceToBeCreated)
		const permission = await resourceRepository.getResourceById(createdResource.id)
		expect(permission!.id).toBe(createdResource.id)
		expect(permission!.name).toBe(createdResource.name)
	})

	it('should list all resources', async () => {
		const resource1 = await resourceRepository.create(Resource.create('TEST1'))
		const resource2 = await resourceRepository.create(Resource.create('TEST2'))
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
		const permission = await resourceRepository.getResourceById(crypto.randomUUID())
		expect(permission).toBeNull()
	})

	it('should update an existing resource', async () => {
		const resourceToBeCreated = Resource.create('TEST')
		const createdResource = await resourceRepository.create(resourceToBeCreated)
		const resourceToBeUpdated = Resource.restore(createdResource.id, 'UPDATED_TEST')
		const updatedPermission = await resourceRepository.updateResource(resourceToBeUpdated)
		expect(updatedPermission).not.toBeNull()
		expect(updatedPermission!.id).toBe(resourceToBeUpdated.id)
		expect(updatedPermission!.name).toBe('UPDATED_TEST')
	})

	it("should return null when trying to update a resource that doesn't exist", async () => {
		const resourceToBeUpdated = Resource.restore(crypto.randomUUID(), 'NON_EXISTENT')
		const updatedResource = await resourceRepository.updateResource(resourceToBeUpdated)
		expect(updatedResource).toBeNull()
	})

	it('should delete an existing resource', async () => {
		const resourceToBeCreated = Resource.create('TEST')
		const createdResource = await resourceRepository.create(resourceToBeCreated)
		const deletedResource = await resourceRepository.deleteResource(createdResource.id)
		expect(deletedResource).not.toBeNull()
		expect(deletedResource!.id).toBe(createdResource.id)
		expect(deletedResource!.name).toBe('TEST')
		const permission = await resourceRepository.getResourceById(deletedResource!.id)
		expect(permission).toBeNull()
	})

	it("should return null when trying to delete a resource that doesn't exist", async () => {
		const deletedPermission = await resourceRepository.deleteResource(crypto.randomUUID())
		expect(deletedPermission).toBeNull()
	})
})
