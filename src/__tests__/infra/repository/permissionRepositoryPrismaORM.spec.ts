import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import Permission from '#domain/rbac/permission/Permission.js'
import PermissionRepositoryPrismaORM from '#infra/repository/rbac/PermissionRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client'

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
		const permissionToBeCreated = Permission.create('TEST', 'Foo bar')
		const createdPermission = await permissionRepository.create(permissionToBeCreated)
		const foundPermission = await permissionRepository.findPermissionById(createdPermission.id)
		expect(foundPermission!.id).toBe(createdPermission.id)
		expect(foundPermission!.name).toBe(createdPermission.name)
		expect(foundPermission!.description).toBe(createdPermission.description)
	})

	it('should list all permissions', async () => {
		const permissionCreated1 = await permissionRepository.create(
			Permission.create('TEST1', 'Foo bar'),
		)
		const permissionCreated2 = await permissionRepository.create(
			Permission.create('TEST2', 'Foo bar'),
		)
		const foundPermissions = await permissionRepository.listPermissions()
		expect(foundPermissions.length).toBe(2)
		expect(foundPermissions).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: permissionCreated1.id,
					name: permissionCreated1.name,
				}),
				expect.objectContaining({
					id: permissionCreated2.id,
					name: permissionCreated2.name,
				}),
			]),
		)
	})

	it("should return null when trying to get a permission that doesn't exist", async () => {
		const foundPermission = await permissionRepository.findPermissionById(crypto.randomUUID())
		expect(foundPermission).toBeNull()
	})

	it('should update an existing permission', async () => {
		const permissionToBeCreated = Permission.create('TEST', 'Foo bar')
		const createdPermission = await permissionRepository.create(permissionToBeCreated)
		createdPermission.updateData({
			name: 'UPDATED_TEST',
			description: 'Updated description',
		})
		const updatedPermission = await permissionRepository.updatePermission(createdPermission)
		expect(updatedPermission).not.toBeNull()
		expect(updatedPermission!.id).toBe(createdPermission.id)
		expect(updatedPermission!.name).toBe('UPDATED_TEST')
		expect(updatedPermission!.description).toBe('Updated description')
	})

	it("should return null when trying to update a permission that doesn't exist", async () => {
		const permissionToBeUpdated = Permission.create('NON_EXISTENT', 'Foo bar')
		const updatedPermission = await permissionRepository.updatePermission(permissionToBeUpdated)
		expect(updatedPermission).toBeNull()
	})

	it('should delete an existing permission', async () => {
		const permissionToBeCreated = Permission.create('TEST', "Foo bar")
		const permissionCreated = await permissionRepository.create(permissionToBeCreated)
		const deletedPermission = await permissionRepository.deletePermission(permissionCreated.id)
		expect(deletedPermission).not.toBeNull()
		expect(deletedPermission!.id).toBe(permissionCreated.id)
		expect(deletedPermission!.name).toBe('TEST')
		expect(deletedPermission!.description).toBe('Foo bar')
		const permission = await permissionRepository.findPermissionById(deletedPermission!.id)
		expect(permission).toBeNull()
	})

	it("should return null when trying to delete a permission that doesn't exist", async () => {
		const deletedPermission = await permissionRepository.deletePermission(crypto.randomUUID())
		expect(deletedPermission).toBeNull()
	})
})
