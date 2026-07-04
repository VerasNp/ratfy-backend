import type Album from '#domain/album/Album.js'
import type Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import AlbumRepositoryPrismaORM from '#infra/repository/AlbumRepositoryPrismaORM.js'
import ArtistRepositoryPrismaORM from '#infra/repository/ArtistRepositoryPrismaORM.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import { PrismaClient } from '#prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { afterAll, beforeEach, describe, inject } from 'vitest'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const userRepository = new UserRepositoryPrismaORM(prisma)
const artistRepository = new ArtistRepositoryPrismaORM(prisma)
const albumRepository = new AlbumRepositoryPrismaORM(prisma)

let dummyUsers: User[]
let dummyArtists: Artist[]
let dummyAlbuns: Album[]

beforeEach(async () => {
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "AlbumArtist" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
	await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
})

afterAll(async () => {
	await prisma.$disconnect()
})

describe('AlbumRepositoryPrismaORM', () => {
	describe("create", () => {
		
	})
})
