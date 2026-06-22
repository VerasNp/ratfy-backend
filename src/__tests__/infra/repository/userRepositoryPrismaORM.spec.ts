import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../../prisma/generated/prisma/client'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import User from '#domain/user/User.js'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('UserRepositoryPrismaORM', () => {
	const userRepository = new UserRepositoryPrismaORM(prisma)
	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should create a new user', async () => {
		const userToBeCreated = User.create(
			'Test User',
			'test@example.com',
			'Valid@123',
			new Date('1990-01-01'),
			null
		)
		const createdUser = await userRepository.create(userToBeCreated)
		const foundUser = await userRepository.findById(createdUser.id)
		expect(foundUser!.id).toBe(createdUser.id)
		expect(foundUser!.name).toBe(createdUser.name)
		expect(foundUser!.email.value).toBe(createdUser.email.value)
	})
})
