import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../../prisma/generated/prisma/client'
import UserRoleRepositoryPrismaORM from '#infra/repository/UserRoleRepositoryPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import User from '#domain/user/User.js'
import RoleRepositoryPrismaORM from '#infra/repository/RoleRepositoryPrismaORM.js'
import Role from '#domain/rbac/role/Role.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const userRoleRepository = new UserRoleRepositoryPrismaORM(prisma)
const userRepository = new UserRepositoryPrismaORM(prisma)
const roleRepository = new RoleRepositoryPrismaORM(prisma)

let dummyRole: Role
let dummyUser: User

beforeEach(async () => {
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "UsersRoles" RESTART IDENTITY CASCADE')
	dummyRole = Role.create('ROLE', null)
	await roleRepository.create(dummyRole)
	dummyUser = User.create('Test User', 'foo222@bar.com', 'Valid@123', new Date('1990-01-01'))
	await userRepository.create(dummyUser)
})

describe('UserRoleRepositoryPrismaORM', () => {
	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should assign a role to a user', async () => {
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		const userRole = await prisma.usersRoles.findUnique({
			where: {
				userId_roleId: { userId: dummyUser.id, roleId: dummyRole.id },
			},
		})

		expect(userRole).not.toBeNull()
		expect(userRole!.userId).toBe(dummyUser.id)
		expect(userRole!.roleId).toBe(dummyRole.id)
	})

	it('should find roles by user ID', async () => {
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		const roles = await userRoleRepository.findRolesByUserId(dummyUser.id)
		expect(roles).not.toBeNull()
		expect(roles!.length).toBe(1)
		expect(roles[0]!.id).toBe(dummyRole.id)
	})

	it('should return an empty array if the user has no roles', async () => {
		const roles = await userRoleRepository.findRolesByUserId(dummyUser.id)
		expect(roles).toEqual([])
	})

	it('should revoke a role from a user', async () => {
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		await userRoleRepository.revokeRoleFromUser(dummyUser.id, dummyRole.id)
		const userRole = await prisma.usersRoles.findUnique({
			where: {
				userId_roleId: { userId: dummyUser.id, roleId: dummyRole.id },
			},
		})
		expect(userRole).toBeNull()
	})
})
