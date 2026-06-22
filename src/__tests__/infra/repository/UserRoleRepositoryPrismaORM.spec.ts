import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../../prisma/generated/prisma/client'
import UserRoleRepositoryPrismaORM from '#infra/repository/UserRoleRepositoryPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import User from '#domain/user/User.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('UserRoleRepositoryPrismaORM', async () => {
	const userRoleRepository = new UserRoleRepositoryPrismaORM(prisma)
	const userRepository = new UserRepositoryPrismaORM(prisma)
	const userToBeCreated = User.create(
		'Test User',
		'foo@bar.com',
		'Valid@123',
		new Date('1990-01-01'),
	)

	await userRepository.create(userToBeCreated)

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "UsersRoles" RESTART IDENTITY CASCADE')
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should assign a role to a user', async () => {
		const userId = crypto.randomUUID()
		const roleId = crypto.randomUUID()

		await userRoleRepository.assignRoleToUser(userId, roleId)
		const userRole = await prisma.usersRoles.findUnique({
			where: {
				userId_roleId: {
					userId,
					roleId,
				},
			},
		})
		expect(userRole).not.toBeNull()
		expect(userRole!.userId).toBe(userId)
		expect(userRole!.roleId).toBe(roleId)
	})
})
