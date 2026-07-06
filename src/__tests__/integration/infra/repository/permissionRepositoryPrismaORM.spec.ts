import { createDummyOperationPrismaORM, createDummyPermissionPrismaORM, createDummyResourcePrismaORM } from '#__tests__/factories/RbacFactory.js'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import Operation from '#domain/rbac/operation/Operation.js'
import Permission from '#domain/rbac/permission/Permission.js'
import Resource from '#domain/rbac/resource/Resource.js'
import { PrismaClient } from '#prisma/client'
import PermissionRepositoryPrismaORM from '#infra/repository/rbac/PermissionRepositoryPrismaORM.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('PermissionRepositoryPrismaORM', () => {
	const permissionRepository = new PermissionRepositoryPrismaORM(prisma)

	let dummyOperation: Operation
	let dummyResource: Resource

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Permission" RESTART IDENTITY CASCADE')
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Operation" RESTART IDENTITY CASCADE')
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Resource" RESTART IDENTITY CASCADE')
		dummyOperation = await createDummyOperationPrismaORM(prisma, { name: 'TEST_OPERATION' })
		dummyResource = await createDummyResourcePrismaORM(prisma, { name: 'TEST_RESOURCE' })
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should create a new permission', async () => {
		const permissionToCreate = Permission.create(dummyOperation, dummyResource)
		await permissionRepository.createPermission(permissionToCreate)
		const foundPermission = await permissionRepository.findPermissionById(permissionToCreate.id)
		expect(foundPermission).not.toBeNull()
		expect(foundPermission!.id).toBe(permissionToCreate.id)
		expect(foundPermission!.label).toBe('TEST_OPERATION:TEST_RESOURCE')
	})

	it('should list all permissions', async () => {
		const anotherOp = await createDummyOperationPrismaORM(prisma, { name: 'ANOTHER_OP' })
		const anotherRes = await createDummyResourcePrismaORM(prisma, { name: 'ANOTHER_RES' })
		const perm1 = await createDummyPermissionPrismaORM(prisma, {
			operationId: dummyOperation.id,
			resourceId: dummyResource.id,
		})
		const perm2 = await createDummyPermissionPrismaORM(prisma, {
			operationId: anotherOp.id,
			resourceId: anotherRes.id,
		})
		const permissions = await permissionRepository.listPermissions()
		expect(permissions.length).toBe(2)
		expect(permissions).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: perm1.id }),
				expect.objectContaining({ id: perm2.id }),
			]),
		)
	})

	it('should return null when trying to get a permission that does not exist', async () => {
		const found = await permissionRepository.findPermissionById(crypto.randomUUID())
		expect(found).toBeNull()
	})

	it('should find a permission by operation and resource IDs', async () => {
		await permissionRepository.createPermission(Permission.create(dummyOperation, dummyResource))
		const found = await permissionRepository.findPermissionByOperationIdAndResourceId(
			dummyOperation.id,
			dummyResource.id,
		)
		expect(found).not.toBeNull()
		expect(found!.label).toBe('TEST_OPERATION:TEST_RESOURCE')
	})

	it('should delete an existing permission', async () => {
		const permissionToCreate = Permission.create(dummyOperation, dummyResource)
		await permissionRepository.createPermission(permissionToCreate)
		await permissionRepository.deletePermission(permissionToCreate.id)
		const found = await permissionRepository.findPermissionById(permissionToCreate.id)
		expect(found).toBeNull()
	})

	it('should list permissions by operation ID', async () => {
		await permissionRepository.createPermission(Permission.create(dummyOperation, dummyResource))
		const found = await permissionRepository.listPermissionsByOperationId(dummyOperation.id)
		expect(found).toHaveLength(1)
	})

	it('should list permissions by resource ID', async () => {
		await permissionRepository.createPermission(Permission.create(dummyOperation, dummyResource))
		const found = await permissionRepository.listPermissionsByResourceId(dummyResource.id)
		expect(found).toHaveLength(1)
	})
})
