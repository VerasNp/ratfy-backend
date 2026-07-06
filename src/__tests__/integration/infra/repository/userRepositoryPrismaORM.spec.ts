import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import Role from '#domain/rbac/role/Role.js'
import User from '#domain/user/User.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client'
import { createDummyRolePrismaORM } from '#__tests__/factories/RoleFactory.js'
import { createDummyUserPrismaORM } from '#__tests__/factories/UserFactory.js'
import UserRoleRepositoryPrismaORM from '#infra/repository/rbac/UserRoleRepositoryPrismaORM.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const userRepository = new UserRepositoryPrismaORM(prisma)

afterAll(async () => {
	await prisma.$disconnect()
})

describe('UserRepositoryPrismaORM', () => {
	describe('create', () => {
		let dummyRole: Role
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserRole" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
			dummyRole = await createDummyRolePrismaORM(prisma, {
				name: 'ROLE1',
				description: 'Test Role 1',
			})
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
			expect(foundUser!.email).toBe(createdUser.email)
			expect(foundUser!.birthDate.getTime()).toBe(createdUser.birthDate.getTime())
		})
	})

	describe('findById', () => {
		let dummyRole: Role
		let dummyUser: User
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserRole" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
			dummyRole = await createDummyRolePrismaORM(prisma, {
				name: 'ROLE1',
				description: 'Test Role 1',
			})
			dummyUser = await createDummyUserPrismaORM(prisma, {
				roles: [dummyRole],
			})
		})
		it('should find user by id with roles', async () => {
			const foundUser = await userRepository.findById(dummyUser.id)
			expect(foundUser).not.toBeNull()
			expect(foundUser!.roles.length).toBe(1)
			expect(foundUser!.roles[0]!.id).toBe(dummyRole.id)
			expect(foundUser!.roles[0]!.name.value).toBe(dummyRole.name.value)
		})
		it('should return null if user not found', async () => {
			const foundUser = await userRepository.findById('non-existent-id')
			expect(foundUser).toBeNull()
		})
		it('should return empty roles array when user has no roles', async () => {
			let dummyUserWithoutRoles = await createDummyUserPrismaORM(prisma, {
				email: 'another@bar.com',
				roles: [],
			})
			const foundUser = await userRepository.findById(dummyUserWithoutRoles.id)
			expect(foundUser).not.toBeNull()
			expect(foundUser!.roles).toEqual([])
		})
	})
	describe('findByEmail', () => {
		let dummyRole: Role
		let dummyUser: User
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserRole" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
			dummyRole = await createDummyRolePrismaORM(prisma, {
				name: 'ROLE1',
				description: 'Test Role 1',
			})
			dummyUser = await createDummyUserPrismaORM(prisma, {
				roles: [dummyRole],
			})
		})
		it('should find user by email with roles', async () => {
			const foundUser = await userRepository.findByEmail(dummyUser.email)
			expect(foundUser).not.toBeNull()
			expect(foundUser!.roles.length).toBe(1)
			expect(foundUser!.roles[0]!.id).toBe(dummyRole.id)
		})
	})

	describe('updateUser', () => {
		let dummyRole: Role
		let dummyUser: User
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserRole" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
			dummyRole = await createDummyRolePrismaORM(prisma, {
				name: 'ROLE1',
				description: 'Test Role 1',
			})
			dummyUser = await createDummyUserPrismaORM(prisma, {
				roles: [dummyRole],
			})
		})
		it('should update user data and preserve roles', async () => {
			const user = await userRepository.findById(dummyUser.id)
			user!.updateData({ name: 'Updated Name' })
			const updatedUser = await userRepository.updateUser(user!)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser!.name).toBe('Updated Name')
			expect(updatedUser!.roles.length).toBe(1)
			expect(updatedUser!.roles[0]!.id).toBe(dummyRole.id)
		})
		it('should update user data and remove roles when no roles are provided', async () => {
			let userRoleRepository = new UserRoleRepositoryPrismaORM(prisma)
			const dummyRole2 = await createDummyRolePrismaORM(prisma, {
				name: 'ROLE2',
				description: 'Test Role 2',
			})
			await userRoleRepository.assignRoleToUser(dummyUser.id, dummyRole2.id)
			const user = await userRepository.findById(dummyUser.id)
			user!.updateData({ name: 'Updated Name' })
			const updatedUser = await userRepository.updateUser(user!)
			expect(updatedUser).not.toBeNull()
			expect(updatedUser!.roles.length).toBe(2)
			const roleIds = updatedUser!.roles.map((r) => r.id).sort()
			expect(roleIds).toEqual([dummyRole.id, dummyRole2.id].sort())
		})
	})

	describe('findAll', () => {
		let dummyRole: Role
		let dummyUser: User
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserRole" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Role" RESTART IDENTITY CASCADE')
			dummyRole = await createDummyRolePrismaORM(prisma, {
				name: 'ROLE1',
				description: 'Test Role 1',
			})
			dummyUser = await createDummyUserPrismaORM(prisma, {
				roles: [dummyRole],
			})
		})
		it('should return user with roles in findAll', async () => {
			const users = await userRepository.findAll()
			expect(users.length).toBeGreaterThanOrEqual(1)
			const foundUser = users.find((u) => u.id === dummyUser.id)
			expect(foundUser).not.toBeUndefined()
			expect(foundUser!.roles.length).toBe(1)
			expect(foundUser!.roles[0]!.id).toBe(dummyRole.id)
		})
	})
})
