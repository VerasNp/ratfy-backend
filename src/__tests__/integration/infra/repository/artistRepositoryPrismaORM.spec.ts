import {
	createDummyArtist,
	createDummyArtistPrismaORM,
} from '#__tests__/factories/ArtistFactory.js'
import { createDummyUserPrismaORM } from '#__tests__/factories/UserFactory.js'
import type User from '#domain/user/User.js'
import ArtistRepositoryPrismaORM from '#infra/repository/ArtistRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const artistRepository = new ArtistRepositoryPrismaORM(prisma)

afterAll(async () => {
	await prisma.$disconnect()
})

describe('ArtistRepositoryPrismaORM', () => {
	describe('create', () => {
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
		})
		it('should create an artist', async () => {
			const dummyUser = await createDummyUserPrismaORM(prisma)
			const dummyArtist = createDummyArtist(dummyUser, { bio: 'Test Bio' })

			const createdArtist = await artistRepository.create(dummyArtist)

			const row = await prisma.artist.findUnique({ where: { id: createdArtist.id } })
			expect(row).not.toBeNull()
			expect(row!.id).toBe(dummyArtist.id)
			expect(row!.userId).toBe(dummyUser.id)
			expect(row!.bio).toBe('Test Bio')
		})
		it('should create an artist with null bio', async () => {
			const dummyUser = await createDummyUserPrismaORM(prisma)
			const dummyArtist = createDummyArtist(dummyUser, { bio: null })

			const createdArtist = await artistRepository.create(dummyArtist)

			const row = await prisma.artist.findUnique({ where: { id: createdArtist.id } })
			expect(row).not.toBeNull()
			expect(row!.bio).toBeNull()
		})
	})
	describe('delete', () => {
		let dummyUser: User
		let dummyArtist: ReturnType<typeof createDummyArtist>
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyUser = await createDummyUserPrismaORM(prisma)
			dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
		})
		it('should delete an artist', async () => {
			await artistRepository.delete(dummyArtist.id)
			const deletedArtist = await artistRepository.findById(dummyArtist.id)
			expect(deletedArtist).toBeNull()
		})
		it("should return null if the artist doesn't exist", async () => {
			const result = await artistRepository.delete(crypto.randomUUID())
			expect(result).toBeNull()
		})
	})
	describe('findById', () => {
		let dummyUser: User
		let dummyArtist: ReturnType<typeof createDummyArtist>
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyUser = await createDummyUserPrismaORM(prisma)
			dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
		})
		it('should find an artist by id', async () => {
			const found = await artistRepository.findById(dummyArtist.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(dummyArtist.id)
			expect(found!.userId).toBe(dummyUser.id)
		})
		it("should return null if the artist doesn't exist", async () => {
			const found = await artistRepository.findById(crypto.randomUUID())
			expect(found).toBeNull()
		})
	})
	describe('findByUserId', () => {
		let dummyUser: User
		let dummyArtist: ReturnType<typeof createDummyArtist>
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyUser = await createDummyUserPrismaORM(prisma)
			dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
		})
		it('should find an artist by user id', async () => {
			const found = await artistRepository.findByUserId(dummyUser.id)
			expect(found).not.toBeNull()
			expect(found!.id).toBe(dummyArtist.id)
		})
		it("should return null if no artist exists for the user", async () => {
			const found = await artistRepository.findByUserId(crypto.randomUUID())
			expect(found).toBeNull()
		})
	})
	describe('list', () => {
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			for (let i = 1; i <= 5; i++) {
				const dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				await createDummyArtistPrismaORM(prisma, dummyUser.id)
			}
		})
		it('should list artists with pagination', async () => {
			const foundArtists = await artistRepository.list(1, 3)
			expect(foundArtists.length).toBe(3)
		})
	})
	describe('listByIds', () => {
		let dummyArtists: ReturnType<typeof createDummyArtist>[]
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyArtists = []
			for (let i = 1; i <= 5; i++) {
				const dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
				dummyArtists.push(dummyArtist)
			}
		})
		it('should list artists by their IDs', async () => {
			const ids = dummyArtists.slice(0, 3).map((a) => a.id)
			const foundArtists = await artistRepository.listByIds(ids)
			expect(foundArtists.length).toBe(3)
			expect(foundArtists.map((a) => a.id)).toEqual(expect.arrayContaining(ids))
		})
	})
	describe('update', () => {
		let dummyUser: User
		let dummyArtist: ReturnType<typeof createDummyArtist>
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyUser = await createDummyUserPrismaORM(prisma)
			dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id, {
				bio: 'Original bio',
			})
		})
		it('should update an artist bio', async () => {
			const updatedArtist = await artistRepository.update(dummyArtist.id, { bio: 'Updated bio' })
			expect(updatedArtist).not.toBeNull()
			expect(updatedArtist!.bio).toBe('Updated bio')
		})
		it("should return null if the artist doesn't exist", async () => {
			const updatedArtist = await artistRepository.update(crypto.randomUUID(), {
				bio: 'Updated bio',
			})
			expect(updatedArtist).toBeNull()
		})
	})
	describe('search', () => {
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			for (let i = 1; i <= 5; i++) {
				const dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				await createDummyArtistPrismaORM(prisma, dummyUser.id)
			}
		})
		it('should search artists by user name', async () => {
			const foundArtists = await artistRepository.search(1, 10, 'User 1')
			expect(foundArtists.length).toBeGreaterThanOrEqual(1)
		})
		it('should return all artists when no query is provided', async () => {
			const foundArtists = await artistRepository.search(1, 10)
			expect(foundArtists.length).toBe(5)
		})
	})
})
