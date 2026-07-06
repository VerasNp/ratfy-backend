import { createDummyRole, createDummyRolePrismaORM } from '#__tests__/factories/RbacFactory.js'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#prisma/client.js'
import RoleRepositoryPrismaORM from '#infra/repository/rbac/RoleRepositoryPrismaORM.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('RoleRepositoryPrismaORM', () => {
	const roleRepository = new RoleRepositoryPrismaORM(prisma)

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should create a role', async () => {
		const roleToBeCreated = createDummyRole({ name: 'TEST', description: null })
		const createdRole = await roleRepository.createRole(roleToBeCreated)
		const foundRole = await roleRepository.findRoleById(createdRole.id)
		expect(foundRole!.id).toBe(createdRole.id)
		expect(foundRole!.name.value).toBe(createdRole.name.value)
		expect(foundRole!.description).toBe(createdRole.description)
	})

	it('should list all roles', async () => {
		const role1 = await createDummyRolePrismaORM(prisma, { name: 'TEST1', description: null })
		const role2 = await createDummyRolePrismaORM(prisma, { name: 'TEST2', description: null })
		const foundRoles = await roleRepository.listRoles()
		expect(foundRoles.length).toBe(2)
		expect(foundRoles).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: role1.id, name: role1.name }),
				expect.objectContaining({ id: role2.id, name: role2.name }),
			]),
		)
	})

	it("should return null when trying to get a role that doesn't exist", async () => {
		const role = await roleRepository.findRoleById(crypto.randomUUID())
		expect(role).toBeNull()
	})

	it('should update an existing role', async () => {
		const createdRole = await createDummyRolePrismaORM(prisma, { name: 'TEST', description: null })
		createdRole.updateData({ name: 'TEST_UPDATED', description: 'DESCRIPTION_UPDATED' })
		const updatedRole = await roleRepository.updateRole(createdRole)
		expect(updatedRole).not.toBeNull()
		expect(updatedRole!.id).toBe(createdRole.id)
		expect(updatedRole!.name.value).toBe('TEST_UPDATED')
		expect(updatedRole!.description).toBe('DESCRIPTION_UPDATED')
	})

	it('should return null when trying to update a role that does not exist', async () => {
		const roleToBeUpdated = createDummyRole({ name: 'TEST_UPDATED', description: 'DESCRIPTION_UPDATED' })
		const updatedRole = await roleRepository.updateRole(roleToBeUpdated)
		expect(updatedRole).toBeNull()
	})

	it('should delete an existing role', async () => {
		const createdRole = await createDummyRolePrismaORM(prisma, { name: 'TEST', description: null })
		const deletedRole = await roleRepository.deleteRole(createdRole.id)
		expect(deletedRole).not.toBeNull()
		expect(deletedRole!.id).toBe(createdRole.id)
	})

	it('should return null when trying to delete a role that does not exist', async () => {
		const deletedRole = await roleRepository.deleteRole(crypto.randomUUID())
		expect(deletedRole).toBeNull()
	})
})
