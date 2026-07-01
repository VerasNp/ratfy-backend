import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import User from '#domain/user/User.js'
import Role from '#domain/rbac/role/Role.js'
import { PrismaClient } from '#prisma/client'
import UserRoleRepositoryPrismaORM from '#infra/repository/rbac/UserRoleRepositoryPrismaORM.js'
import RoleRepositoryPrismaORM from '#infra/repository/rbac/RoleRepositoryPrismaORM.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const userRoleRepository = new UserRoleRepositoryPrismaORM(prisma)
const userRepository = new UserRepositoryPrismaORM(prisma)
const roleRepository = new RoleRepositoryPrismaORM(prisma)

let dummyRole: Role
let dummyUser: User

beforeEach(async () => {
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserRole" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
	dummyRole = Role.create('ROLE', null)
	await roleRepository.createRole(dummyRole)
	dummyUser = User.create('Test User', 'foo222@bar.com', 'Valid@123', new Date('1990-01-01'))
	await userRepository.create(dummyUser)
})

describe('UserRoleRepositoryPrismaORM', () => {
	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should assign a role to a user', async () => {
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		const userRoles = await userRoleRepository.findRolesByUserId(dummyUser.id)
		expect(userRoles).not.toBeNull()
		expect(userRoles.length).toBe(1)
		expect(userRoles[0]!.id).toBe(dummyRole.id)
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
		await userRoleRepository.removeRoleFromUser(dummyUser.id, dummyRole.id)
		const usersRoles = await userRoleRepository.findRolesByUserId(dummyUser.id)
		expect(usersRoles).toEqual([])
	})
})
