import { createDummyAlbumPrismaORM } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtistPrismaORM } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUserPrismaORM } from '#__tests__/factories/UserFactory.js'
import Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import AlbumRepositoryPrismaORM from '#infra/repository/AlbumRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const albumRepository = new AlbumRepositoryPrismaORM(prisma)

afterAll(async () => {
	await prisma.$disconnect()
})

describe('AlbumRepositoryPrismaORM', () => {
	describe('update', () => {
		let dummyUsers: User[] = []
		let dummyArtists: Artist[] = []
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			for (let i = 1; i <= 5; i++) {
				let dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				dummyUsers.push(dummyUser)
				let dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
				dummyArtists.push(dummyArtist)
			}
		})
		it('should update an album', async () => {
			let dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
				name: 'Original Album Name',
				albumType: 'single',
				releaseDate: '2022-01-01',
				releasePrecision: 'day',
				totalTracks: 1,
				label: 'Original Label',
				isPublic: false,
				artistIds: [dummyArtists[0]!.id, dummyArtists[1]!.id],
			})
			dummyAlbum.updateData({
				name: 'Updated Album Name',
				albumType: 'ep',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 4,
				label: 'Updated Label',
				isPublic: true,
				artists: [dummyArtists[3]!, dummyArtists[4]!]
			})
			const updatedAlbum = await albumRepository.update(dummyAlbum.id, dummyAlbum)
			expect(updatedAlbum!.name).toBe('Updated Album Name')
			expect(updatedAlbum!.albumType).toBe('ep')
			expect(updatedAlbum!.releaseDate).toBe('2023-01-01')
			expect(updatedAlbum!.releasePrecision).toBe('day')
			expect(updatedAlbum!.totalTracks).toBe(4)
			expect(updatedAlbum!.label).toBe('Updated Label')
			expect(updatedAlbum!.isPublic).toBe(true)
			expect(updatedAlbum!.artistCredits.length).toBe(2)
			expect(updatedAlbum!.artistCredits[0]!.artistId).toBe(dummyArtists[3]!.id)
			expect(updatedAlbum!.artistCredits[1]!.artistId).toBe(dummyArtists[4]!.id)
		})

		it("should return null if the album doesn't exist", async () => {
			const nonExistentAlbumId = 'non-existent-album-id'
			const updatedAlbum = await albumRepository.update(nonExistentAlbumId, {
				name: 'Updated Album Name',
				albumType: 'ep',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 4,
				label: 'Updated Label',
				isPublic: true,
				artistCredits: [],
			})
			expect(updatedAlbum).toBeNull()
		})
	})
	describe('create', () => {
		let dummyUsers: User[] = []
		let dummyArtists: Artist[] = []
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			for (let i = 1; i <= 5; i++) {
				let dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				dummyUsers.push(dummyUser)
				let dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
				dummyArtists.push(dummyArtist)
			}
		})
		it('should create an album', async () => {
			const input = {
				name: 'Test Album',
				albumType: 'album',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 10,
				label: 'Test Label',
				isPublic: true,
				artists: [dummyArtists[0]!, dummyArtists[1]!],
			}
			const albumToCreate = Album.create(input)
			const createdAlbum = await albumRepository.create(albumToCreate)
			expect(createdAlbum.id).toBeDefined()
			expect(createdAlbum.name).toBe(input.name)
			expect(createdAlbum.albumType).toBe(input.albumType)
			expect(createdAlbum.releaseDate).toBe(input.releaseDate)
			expect(createdAlbum.releasePrecision).toBe(input.releasePrecision)
			expect(createdAlbum.totalTracks).toBe(input.totalTracks)
			expect(createdAlbum.label).toBe(input.label)
			expect(createdAlbum.isPublic).toBe(input.isPublic)
			expect(createdAlbum.artistCredits.length).toBe(2)
			expect(createdAlbum.artistCredits[0]!.artistId).toBe(dummyArtists[0]!.id)
			expect(createdAlbum.artistCredits[1]!.artistId).toBe(dummyArtists[1]!.id)
		})
	})
	describe('delete', () => {
		let dummyUsers: User[] = []
		let dummyArtists: Artist[] = []
		let dummyAlbum: Album
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			for (let i = 1; i <= 5; i++) {
				let dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				dummyUsers.push(dummyUser)
				let dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
				dummyArtists.push(dummyArtist)
			}
			dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
				name: 'Test Album',
				albumType: 'album',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 10,
				label: 'Test Label',
				isPublic: true,
				artistIds: dummyArtists.slice(0, 2).map((artist) => artist.id),
			})
		})
		it('should delete an album', async () => {
			await albumRepository.delete(dummyAlbum.id)
			const deletedAlbum = await albumRepository.findById(dummyAlbum.id)
			expect(deletedAlbum).toBeNull()
		})
		it("should return null if the album doesn't exist", async () => {
			const nonExistentAlbumId = 'non-existent-album-id'
			await expect(albumRepository.delete(nonExistentAlbumId)).resolves.toBeUndefined()
		})
	})
	describe('findById', () => {
		let dummyUsers: User[] = []
		let dummyArtists: Artist[] = []
		let dummyAlbum: Album
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			for (let i = 1; i <= 5; i++) {
				let dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				dummyUsers.push(dummyUser)
				let dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
				dummyArtists.push(dummyArtist)
			}
			dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
				name: 'Test Album',
				albumType: 'album',
				releaseDate: '2023-01-01',
				releasePrecision: 'day',
				totalTracks: 10,
				label: 'Test Label',
				isPublic: true,
				artistIds: dummyArtists.slice(0, 2).map((artist) => artist.id),
			})
		})
		it('should find an album by its ID', async () => {
			const foundAlbum = await albumRepository.findById(dummyAlbum.id)
			expect(foundAlbum).not.toBeNull()
			expect(foundAlbum!.id).toBe(dummyAlbum.id)
		})

		it("should return null if the album doesn't exist", async () => {
			const nonExistentAlbumId = 'non-existent-album-id'
			const foundAlbum = await albumRepository.findById(nonExistentAlbumId)
			expect(foundAlbum).toBeNull()
		})
	})

	describe('listByIds', () => {
		let dummyUsers: User[] = []
		let dummyArtists: Artist[] = []
		let dummyAlbums: Album[] = []
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			for (let i = 1; i <= 5; i++) {
				let dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				dummyUsers.push(dummyUser)
				let dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
				dummyArtists.push(dummyArtist)
			}
			for (let i = 1; i <= 5; i++) {
				let dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
					name: `Test Album ${i}`,
					albumType: 'album',
					releaseDate: '2023-01-01',
					releasePrecision: 'day',
					totalTracks: 10,
					label: `Test Label ${i}`,
					isPublic: true,
					artistIds: dummyArtists.slice(0, 2).map((artist) => artist.id),
				})
				dummyAlbums.push(dummyAlbum)
			}
		})
		it('should list albums by their IDs', async () => {
			const albumIds = dummyAlbums.slice(0, 3).map((album) => album.id)
			const foundAlbums = await albumRepository.listByIds(albumIds)
			expect(foundAlbums.length).toBe(3)
			expect(foundAlbums.map((album) => album.id)).toEqual(expect.arrayContaining(albumIds))
		})
	})
	describe('list', () => {
		let dummyUsers: User[] = []
		let dummyArtists: Artist[] = []
		let dummyAlbums: Album[] = []
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			for (let i = 1; i <= 5; i++) {
				let dummyUser = await createDummyUserPrismaORM(prisma, {
					name: `User ${i}`,
					email: `foo${i}@bar.com`,
				})
				dummyUsers.push(dummyUser)
				let dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
				dummyArtists.push(dummyArtist)
			}
			for (let i = 1; i <= 5; i++) {
				let dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
					name: `Test Album ${i}`,
					albumType: 'album',
					releaseDate: '2023-01-01',
					releasePrecision: 'day',
					totalTracks: 10,
					label: `Test Label ${i}`,
					isPublic: true,
					artistIds: dummyArtists.slice(0, 2).map((artist) => artist.id),
				})
				dummyAlbums.push(dummyAlbum)
			}
		})
		it('should list albums', async () => {
			const foundAlbums = await albumRepository.list(1, 10)
			expect(foundAlbums.length).toBe(5)
		})
	})
})
