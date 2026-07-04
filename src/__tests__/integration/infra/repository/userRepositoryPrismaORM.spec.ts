import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import Role from '#domain/rbac/role/Role.js'
import User from '#domain/user/User.js'
import RoleRepositoryPrismaORM from '#infra/repository/rbac/RoleRepositoryPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import UserRoleRepositoryPrismaORM from '#infra/repository/rbac/UserRoleRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('UserRepositoryPrismaORM', () => {
	const userRepository = new UserRepositoryPrismaORM(prisma)
	const roleRepository = new RoleRepositoryPrismaORM(prisma)
	const userRoleRepository = new UserRoleRepositoryPrismaORM(prisma)

	let dummyRole: Role
	let dummyUser: User

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserRole" RESTART IDENTITY CASCADE')
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
		dummyRole = Role.create('ROLE', null)
		await roleRepository.createRole(dummyRole)
		dummyUser = User.create('Test User', 'test@example.com', 'Valid@123', new Date('1990-01-01'))
		await userRepository.create(dummyUser)
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should create a new user', async () => {
		const newUser = User.create(
			'New User',
			'newuser@example.com',
			'Valid@123',
			new Date('1995-06-15'),
		)
		const createdUser = await userRepository.create(newUser)
		const foundUser = await userRepository.findById(createdUser.id)
		expect(foundUser!.id).toBe(createdUser.id)
		expect(foundUser!.name).toBe(createdUser.name)
		expect(foundUser!.email.value).toBe(createdUser.email.value)
	})

	it('should find user by id with roles', async () => {
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		const foundUser = await userRepository.findById(dummyUser.id)
		expect(foundUser).not.toBeNull()
		expect(foundUser!.roles.length).toBe(1)
		expect(foundUser!.roles[0]!.id).toBe(dummyRole.id)
		expect(foundUser!.roles[0]!.name.value).toBe(dummyRole.name.value)
	})

	it('should find user by email with roles', async () => {
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		const foundUser = await userRepository.findByEmail(dummyUser.email.value)
		expect(foundUser).not.toBeNull()
		expect(foundUser!.roles.length).toBe(1)
		expect(foundUser!.roles[0]!.id).toBe(dummyRole.id)
	})

	it('should preserve roles after updateUser', async () => {
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		const user = (await userRepository.findById(dummyUser.id))!
		user.name = 'Updated Name'
		const updatedUser = await userRepository.updateUser(user)
		expect(updatedUser).not.toBeNull()
		expect(updatedUser!.roles.length).toBe(1)
		expect(updatedUser!.roles[0]!.id).toBe(dummyRole.id)

		const refetched = await userRepository.findById(dummyUser.id)
		expect(refetched!.roles.length).toBe(1)
		expect(refetched!.roles[0]!.id).toBe(dummyRole.id)
	})

	it('should preserve roles after updateUser when multiple roles exist', async () => {
		const secondRole = Role.create('ROLE2', null)
		await roleRepository.createRole(secondRole)
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		await userRoleRepository.assignRoleToUser(dummyUser.id, secondRole.id)

		const user = (await userRepository.findById(dummyUser.id))!
		user.name = 'Updated Name'
		const updatedUser = await userRepository.updateUser(user)
		expect(updatedUser).not.toBeNull()
		expect(updatedUser!.roles.length).toBe(2)
		const roleIds = updatedUser!.roles.map((r) => r.id).sort()
		expect(roleIds).toEqual([dummyRole.id, secondRole.id].sort())
	})

	it('should return user with roles in findAll', async () => {
		await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole.id)
		const users = await userRepository.findAll()
		expect(users.length).toBeGreaterThanOrEqual(1)
		const foundUser = users.find((u) => u.id === dummyUser.id)
		expect(foundUser).not.toBeUndefined()
		expect(foundUser!.roles.length).toBe(1)
		expect(foundUser!.roles[0]!.id).toBe(dummyRole.id)
	})

	it('should return empty roles array when user has no roles', async () => {
		const foundUser = await userRepository.findById(dummyUser.id)
		expect(foundUser).not.toBeNull()
		expect(foundUser!.roles).toEqual([])
	})
})
