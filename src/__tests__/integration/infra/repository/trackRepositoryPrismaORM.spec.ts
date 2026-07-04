import { createDummyAlbumPrismaORM } from '#__tests__/factories/AlbumFactory.js'
import { createDummyArtistPrismaORM } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUserPrismaORM } from '#__tests__/factories/UserFactory.js'
import Album from '#domain/album/Album.js'
import Artist from '#domain/artist/Artist.js'
import Track from '#domain/track/Track.js'
import User from '#domain/user/User.js'
import TrackRepositoryPrismaORM from '#infra/repository/TrackRepositoryPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { after, beforeEach } from 'node:test'
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

describe('TrackRepositoryPrismaORM', () => {
	const trackRepository = new TrackRepositoryPrismaORM(prisma)
	const userRepository = new UserRepositoryPrismaORM(prisma)

	beforeEach(async () => {
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Track" RESTART IDENTITY CASCADE')
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('should search tracks with limit, page and query', async () => {
		const dummyUser = await createDummyUserPrismaORM(prisma)
		const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
		const dummyAlbum = await createDummyAlbumPrismaORM(prisma, dummyArtist.id)
		const dummyTracks: Track[] = []
		for (let i = 1; i <= 30; i++) {
			const track = Track.create({
				title: `Track ${i}`,
				durationMs: 300000,
				discNumber: 1,
				trackNumber: i,
				explicit: false,
				isPublic: true,
				album: dummyAlbum,
				artists: [dummyArtist],
			})
			dummyTracks.push(track)
			await trackRepository.create(track)
		}
		const searchResult1 = await trackRepository.search({ page: 1, limit: 15, query: 'Track 1' })
		console.log('searchResult1:', searchResult1)
	})
})
