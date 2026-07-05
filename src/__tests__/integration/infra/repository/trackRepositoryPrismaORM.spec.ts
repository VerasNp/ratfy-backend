import { createDummyAlbumPrismaORM } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtistPrismaORM } from '#__tests__/factories/ArtistFactory.js'
import { createDummyTrackPrismaORM } from '#__tests__/factories/TrackFactory.js'
import { createDummyUserPrismaORM } from '#__tests__/factories/UserFactory.js'
import Album from '#domain/album/Album.js'
import Artist from '#domain/artist/Artist.js'
import Track from '#domain/track/Track.js'
import User from '#domain/user/User.js'
import TrackRepositoryPrismaORM from '#infra/repository/TrackRepositoryPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter, log: ['query', 'info', 'warn', 'error'] })

const trackRepository = new TrackRepositoryPrismaORM(prisma)

afterAll(async () => {
	await prisma.$disconnect()
})

describe('TrackRepositoryPrismaORM', () => {
	describe('search', () => {
		let dummyTracks: Track[] = []
		let dummyAlbums: Album[] = []
		let dummyUsers: User[] = []
		let dummyArtists: Artist[] = []
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Track" RESTART IDENTITY CASCADE')
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
				let dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
					artists: [dummyArtist],
					name: `Album ${i}`,
				})
				dummyAlbums.push(dummyAlbum)
				for (let j = 1; j <= 6; j++) {
					let dummyTrack = await createDummyTrackPrismaORM(prisma, {
						album: dummyAlbum,
						title: `Track ${j} of Album ${i}`,
					})
					dummyTracks.push(dummyTrack)
				}
			}
		})
		it('should search tracks with limit, page and query', async () => {
			const result = await trackRepository.search({ limit: 15, page: 1, query: 'Track 1' })
			expect(result).toHaveLength(5)
		})
	})
	describe('create', () => {
		let dummyAlbum: Album
		let dummyUser: User
		let dummyArtist: Artist
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Track" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyUser = await createDummyUserPrismaORM(prisma, {
				name: `User 1`,
				email: `foo@bar.com`,
			})
			dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
			dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
				artists: [dummyArtist],
				name: `Album 1`,
			})
		})
		it('should create a track', async () => {
			const trackData = {
				id: 'track-1',
				title: 'Track 1',
				durationMs: 200000,
				discNumber: 1,
				trackNumber: 1,
				explicit: false,
				isPublic: true,
				album: dummyAlbum,
				artists: [dummyArtist],
			}
			const trackToCreate = Track.create(trackData)
			const createdTrack = await trackRepository.create(trackToCreate)
			expect(createdTrack.title).toBe(trackData.title)
			expect(createdTrack.durationMs).toBe(trackData.durationMs)
			expect(createdTrack.discNumber).toBe(trackData.discNumber)
			expect(createdTrack.trackNumber).toBe(trackData.trackNumber)
			expect(createdTrack.explicit).toBe(trackData.explicit)
			expect(createdTrack.isPublic).toBe(trackData.isPublic)
			expect(createdTrack.albumId).toBe(dummyAlbum.id)
			expect(createdTrack.artists[0]!.id).toBe(dummyArtist.id)
		})
	})
	describe('findById', () => {
		let dummyAlbum: Album
		let dummyUser: User
		let dummyArtist: Artist
		let dummyTrack: Track
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Track" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyUser = await createDummyUserPrismaORM(prisma, {
				name: `User 1`,
				email: `foo@bar.com`,
			})
			dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
			dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
				artists: [dummyArtist],
				name: `Album 1`,
			})
			dummyTrack = await createDummyTrackPrismaORM(prisma, {
				album: dummyAlbum,
				artists: [dummyArtist],
				title: 'Track 1',
			})
		})
		it('should find a track by id', async () => {
			const foundTrack = await trackRepository.findById(dummyTrack.id)
			expect(foundTrack).not.toBeNull()
			expect(foundTrack!.id).toBe(dummyTrack.id)
			expect(foundTrack!.title).toBe(dummyTrack.title)
			expect(foundTrack!.albumId).toBe(dummyAlbum.id)
			expect(foundTrack!.artists[0]!.id).toBe(dummyArtist.id)
		})
		it('should return null if the track is not found', async () => {
			const nonExistentTrackId = 'non-existent-track-id'
			const foundTrack = await trackRepository.findById(nonExistentTrackId)
			expect(foundTrack).toBeNull()
		})
	})
	describe('update', () => {
		let dummyAlbum: Album
		let dummyUser: User
		let dummyArtist: Artist
		let dummyTrack: Track
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Track" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyUser = await createDummyUserPrismaORM(prisma, {
				name: `User 1`,
				email: `foo@bar.com`,
			})
			dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
			dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
				artists: [dummyArtist],
				name: `Album 1`,
			})
			dummyTrack = await createDummyTrackPrismaORM(prisma, {
				album: dummyAlbum,
				artists: [dummyArtist],
				title: 'Track 1',
			})
		})
		it('should update a track', async () => {
			const updatedData = {
				title: 'Updated Track Title',
				durationMs: 250000,
				discNumber: 2,
				trackNumber: 3,
				explicit: true,
				isPublic: false,
			}
			const updatedTrack = await trackRepository.update(dummyTrack.id, updatedData)
			expect(updatedTrack).not.toBeNull()
			expect(updatedTrack!.title).toBe(updatedData.title)
			expect(updatedTrack!.durationMs).toBe(updatedData.durationMs)
			expect(updatedTrack!.discNumber).toBe(updatedData.discNumber)
			expect(updatedTrack!.trackNumber).toBe(updatedData.trackNumber)
			expect(updatedTrack!.explicit).toBe(updatedData.explicit)
			expect(updatedTrack!.isPublic).toBe(updatedData.isPublic)
		})
		it('should return null if the track is not found', async () => {
			const nonExistentTrackId = 'non-existent-track-id'
			const updatedData = {
				title: 'Updated Track Title',
				durationMs: 250000,
				discNumber: 2,
				trackNumber: 3,
				explicit: true,
				isPublic: false,
			}
			const updatedTrack = await trackRepository.update(nonExistentTrackId, updatedData)
			expect(updatedTrack).toBeNull()
		})
	})
	describe('delete', () => {
		let dummyAlbum: Album
		let dummyUser: User
		let dummyArtist: Artist
		let dummyTrack: Track
		beforeEach(async () => {
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Track" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
			await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
			dummyUser = await createDummyUserPrismaORM(prisma, {
				name: `User 1`,
				email: `foo@bar.com`,
			})
			dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
			dummyAlbum = await createDummyAlbumPrismaORM(prisma, {
				artists: [dummyArtist],
				name: `Album 1`,
			})
			dummyTrack = await createDummyTrackPrismaORM(prisma, {
				album: dummyAlbum,
				artists: [dummyArtist],
				title: 'Track 1',
			})
		})
		it('should delete a track', async () => {
			await trackRepository.delete(dummyTrack.id)
			const foundTrack = await trackRepository.findById(dummyTrack.id)
			expect(foundTrack).toBeNull()
		})
	})
})
