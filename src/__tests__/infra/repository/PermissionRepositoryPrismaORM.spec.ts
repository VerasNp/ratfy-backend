import PermissionRepositoryPrismaORM from '#infra/repository/PermissionRepositoryPrismaORM.js'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../../prisma/generated/prisma/client'
import Permission from '#domain/rbac/permission/Permission.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('PermissionRepositoryPrismaORM', () => {
	const permissionRepository = new PermissionRepositoryPrismaORM(prisma)

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Permission" RESTART IDENTITY CASCADE')
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should create a new permission', async () => {
		const permissionToBeCreated = Permission.create('TEST', null)
		const createdPermission = await permissionRepository.create(permissionToBeCreated)
		const permission = await permissionRepository.getPermissionById(createdPermission.id)
		expect(permission!.id).toBe(createdPermission.id)
		expect(permission!.name).toBe(createdPermission.name)
		expect(permission!.description).toBe(createdPermission.description)
	})

	it('should list all permissions', async () => {
		const permission1 = await permissionRepository.create(Permission.create('TEST1', null))
		const permission2 = await permissionRepository.create(Permission.create('TEST2', null))
		const permissions = await permissionRepository.listPermissions()
		expect(permissions.length).toBe(2)
		expect(permissions).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: permission1.id, name: permission1.name }),
				expect.objectContaining({ id: permission2.id, name: permission2.name }),
			]),
		)
	})

	it("should return null when trying to get a permission that doesn't exist", async () => {
		const permission = await permissionRepository.getPermissionById(crypto.randomUUID())
		expect(permission).toBeNull()
	})

	it('should update an existing permission', async () => {
		const permissionToBeCreated = Permission.create('TEST', null)
		const createdPermission = await permissionRepository.create(permissionToBeCreated)
		const permissionToBeUpdated = Permission.restore(
			createdPermission.id,
			'UPDATED_TEST',
			'Updated description',
		)
		const updatedPermission = await permissionRepository.updatePermission(permissionToBeUpdated)
		expect(updatedPermission).not.toBeNull()
		expect(updatedPermission!.id).toBe(permissionToBeUpdated.id)
		expect(updatedPermission!.name).toBe('UPDATED_TEST')
		expect(updatedPermission!.description).toBe('Updated description')
	})

	it("should return null when trying to update a permission that doesn't exist", async () => {
		const permissionToBeUpdated = Permission.restore(crypto.randomUUID(), 'NON_EXISTENT', null)
		const updatedPermission = await permissionRepository.updatePermission(permissionToBeUpdated)
		expect(updatedPermission).toBeNull()
	})

	it('should delete an existing permission', async () => {
		const permissionToBeCreated = Permission.create('TEST', null)
		const permissionCreated = await permissionRepository.create(permissionToBeCreated)
		const deletedPermission = await permissionRepository.deletePermission(permissionCreated.id)
		expect(deletedPermission).not.toBeNull()
		expect(deletedPermission!.id).toBe(permissionCreated.id)
		expect(deletedPermission!.name).toBe('TEST')
		expect(deletedPermission!.description).toBeNull()
		const permission = await permissionRepository.getPermissionById(deletedPermission!.id)
		expect(permission).toBeNull()
	})

	it("should return null when trying to delete a permission that doesn't exist", async () => {
		const deletedPermission = await permissionRepository.deletePermission(crypto.randomUUID())
		expect(deletedPermission).toBeNull()
	})
})
