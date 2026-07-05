// <<<<<<< HEAD
// import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
// import { PrismaPg } from '@prisma/adapter-pg'
// import ArtistRepositoryPrisma from '#infra/repository/ArtistRepositoryPrisma.js'
// import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
// import User from '#domain/user/User.js'
// import Artist from '#domain/artist/Artist.js'
// import { PrismaClient } from '#prisma/client'
// =======
// import {
// 	createDummyArtist,
// 	createDummyArtistPrismaORM,
// } from '#__tests__/factories/ArtistFactory.js'
// import { createDummyUserPrismaORM } from '#__tests__/factories/UserFactory.js'
// import ArtistRepositoryPrismaORM from '#infra/repository/ArtistRepositoryPrismaORM.js'
// import { PrismaClient } from '#prisma/client'
// import { PrismaPg } from '@prisma/adapter-pg'
// import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
// >>>>>>> bace5aa (refactor: corrige o uso de artists)

// const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
// const prisma = new PrismaClient({ adapter })

// <<<<<<< HEAD
// const artistRepository = new ArtistRepositoryPrisma(prisma)
// const userRepository = new UserRepositoryPrismaORM(prisma)

// let dummyUser: User

// beforeEach(async () => {
//   await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
//   await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
//   dummyUser = User.create('Test User', 'artist-test@example.com', 'Valid@123', new Date('1990-01-01'))
//   await userRepository.create(dummyUser)
// })

// describe('ArtistRepositoryPrisma', () => {
//   afterAll(async () => {
//     await prisma.$disconnect()
//   })

//   describe('create', () => {
//     it('should create a new artist', async () => {
//       const artist = Artist.create({ userId: dummyUser.id, bio: 'Test bio' })

//       const created = await artistRepository.create(artist)

//       const row = await prisma.artist.findUnique({ where: { id: created.id } })
//       expect(row).not.toBeNull()
//       expect(row!.id).toBe(artist.id)
//       expect(row!.userId).toBe(dummyUser.id)
//       expect(row!.bio).toBe('Test bio')
//     })

//     it('should create an artist with null bio', async () => {
//       const artist = Artist.create({ userId: dummyUser.id })

//       const created = await artistRepository.create(artist)

//       const row = await prisma.artist.findUnique({ where: { id: created.id } })
//       expect(row).not.toBeNull()
//       expect(row!.bio).toBeNull()
//     })
//   })

//   describe('findById', () => {
//     it('should find an artist by id', async () => {
//       const artist = Artist.create({ userId: dummyUser.id, bio: 'Find me' })
//       await artistRepository.create(artist)

//       const found = await artistRepository.findById(artist.id)

//       expect(found).not.toBeNull()
//       expect(found!.id).toBe(artist.id)
//       expect(found!.userId).toBe(dummyUser.id)
//       expect(found!.bio).toBe('Find me')
//     })

//     it('should return null when artist does not exist', async () => {
//       const found = await artistRepository.findById(crypto.randomUUID())
//       expect(found).toBeNull()
//     })
//   })

//   describe('findByUserId', () => {
//     it('should find an artist by user id', async () => {
//       const artist = Artist.create({ userId: dummyUser.id, bio: 'By userId' })
//       await artistRepository.create(artist)

//       const found = await artistRepository.findByUserId(dummyUser.id)

//       expect(found).not.toBeNull()
//       expect(found!.id).toBe(artist.id)
//       expect(found!.userId).toBe(dummyUser.id)
//     })

//     it('should return null when no artist exists for the user', async () => {
//       const found = await artistRepository.findByUserId(crypto.randomUUID())
//       expect(found).toBeNull()
//     })
//   })

//   describe('listByIds', () => {
//     it('should return artists matching the given ids', async () => {
//       const user2 = User.create('User 2', 'list-by-ids-1@example.com', 'Valid@123', new Date('1990-01-01'))
//       const user3 = User.create('User 3', 'list-by-ids-2@example.com', 'Valid@123', new Date('1990-01-01'))
//       await userRepository.create(user2)
//       await userRepository.create(user3)
//       const artist1 = Artist.create({ userId: user2.id, bio: 'Artist 1' })
//       const artist2 = Artist.create({ userId: user3.id, bio: 'Artist 2' })
//       await artistRepository.create(artist1)
//       await artistRepository.create(artist2)

//       const result = await artistRepository.listByIds([artist1.id, artist2.id])

//       expect(result).toHaveLength(2)
//       expect(result.map((a) => a.id)).toEqual(expect.arrayContaining([artist1.id, artist2.id]))
//     })

//     it('should return empty array when no ids match', async () => {
//       const result = await artistRepository.listByIds([crypto.randomUUID()])
//       expect(result).toEqual([])
//     })

//     it('should return only matching artists when some ids do not exist', async () => {
//       const artist = Artist.create({ userId: dummyUser.id, bio: 'Only me' })
//       await artistRepository.create(artist)

//       const result = await artistRepository.listByIds([artist.id, crypto.randomUUID()])

//       expect(result).toHaveLength(1)
//       expect(result[0]!.id).toBe(artist.id)
//     })
//   })

//   describe('list', () => {
//     it('should return a paginated list of artists ordered by createdAt desc', async () => {
//       const user2 = User.create('User 2', 'list-paginated-1@example.com', 'Valid@123', new Date('1990-01-01'))
//       const user3 = User.create('User 3', 'list-paginated-2@example.com', 'Valid@123', new Date('1990-01-01'))
//       await userRepository.create(user2)
//       await userRepository.create(user3)
//       const artist1 = Artist.create({ userId: user2.id, bio: 'First' })
//       const artist2 = Artist.create({ userId: user3.id, bio: 'Second' })
//       await artistRepository.create(artist1)
//       await artistRepository.create(artist2)

//       const result = await artistRepository.list(1, 10)

//       expect(result.length).toBeGreaterThanOrEqual(2)
//     })

//     it('should respect limit parameter', async () => {
//       for (let i = 0; i < 3; i++) {
//         const user = User.create(`User ${i}`, `artist-list-${i}@example.com`, 'Valid@123', new Date('1990-01-01'))
//         await userRepository.create(user)
//         const artist = Artist.create({ userId: user.id, bio: `Artist ${i}` })
//         await artistRepository.create(artist)
//       }

//       const result = await artistRepository.list(1, 2)

//       expect(result).toHaveLength(2)
//     })
//   })

//   describe('update', () => {
//     it('should update the artist bio', async () => {
//       const artist = Artist.create({ userId: dummyUser.id, bio: 'Old bio' })
//       await artistRepository.create(artist)

//       await artistRepository.update(artist.id, { bio: 'Updated bio' })

//       const row = await prisma.artist.findUnique({ where: { id: artist.id } })
//       expect(row!.bio).toBe('Updated bio')
//     })
//   })

//   describe('delete', () => {
//     it('should delete an existing artist', async () => {
//       const artist = Artist.create({ userId: dummyUser.id, bio: 'To delete' })
//       await artistRepository.create(artist)

//       await artistRepository.delete(artist.id)

//       const row = await prisma.artist.findUnique({ where: { id: artist.id } })
//       expect(row).toBeNull()
//     })

//     it('should not throw when deleting a non-existent artist', async () => {
//       await expect(artistRepository.delete(crypto.randomUUID())).rejects.toThrow()
//     })
//   })
// =======
// describe('ArtistRepositoryPrismaORM', () => {
// 	beforeEach(async () => {
// 		await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
// 		await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
// 	})

// 	afterAll(async () => {
// 		await prisma.$disconnect()
// 	})

// 	const artistRepository = new ArtistRepositoryPrismaORM(prisma)

// 	it('should delete an artist and return the deleted artist', async () => {
// 		const dummyUser = await createDummyUserPrismaORM(prisma)
// 		const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
// 		const deletedArtist = await artistRepository.delete(dummyArtist.id)
// 		expect(deletedArtist.id).toBe(dummyArtist.id)
// 		expect(deletedArtist.userId).toBe(dummyArtist.userId)
// 		expect(deletedArtist.bio).toBe(dummyArtist.bio)
// 		expect(deletedArtist.user?.name).toBe(dummyUser.name)
// 	})

// 	it('should search artists with limit, page and query', async () => {
// 		const dummyUsers = []
// 		const dummyArtists = []
// 		for (let i = 1; i <= 30; i++) {
// 			const dummyUser = await createDummyUserPrismaORM(prisma, {
// 				email: `foo${i}@bar.com`,
// 				name: `Foo ${i}`,
// 			})
// 			dummyUsers.push(dummyUser)
// 			const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
// 			dummyArtists.push(dummyArtist)
// 		}
// 		const artists = await artistRepository.search(1, 15, dummyUsers[0]!.name)
// 		expect(artists).toHaveLength(11)
// 	})

// 	it('should create an artist and return the created artist', async () => {
// 		const dummyUser = await createDummyUserPrismaORM(prisma)
// 		const dummyArtist = createDummyArtist(dummyUser, {
// 			bio: 'Dummy Bio',
// 		})
// 		const createdArtist = await artistRepository.create(dummyArtist)
// 		expect(createdArtist.id).toBe(dummyArtist.id)
// 		expect(createdArtist.userId).toBe(dummyArtist.userId)
// 		expect(createdArtist.bio).toBe(dummyArtist.bio)
// 		expect(createdArtist.user?.name).toBe(dummyUser.name)
// 	})

// 	it('should delete an artist and return the deleted artist', async () => {
// 		const dummyUser = await createDummyUserPrismaORM(prisma)
// 		const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
// 		const deletedArtist = await artistRepository.delete(dummyArtist.id)
// 		expect(deletedArtist.id).toBe(dummyArtist.id)
// 		expect(deletedArtist.userId).toBe(dummyArtist.userId)
// 		expect(deletedArtist.bio).toBe(dummyArtist.bio)
// 		expect(deletedArtist.user?.name).toBe(dummyUser.name)
// 	})

// 	it('should find an artist by id and return the artist', async () => {
// 		const dummyUser = await createDummyUserPrismaORM(prisma)
// 		const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
// 		const foundArtist = await artistRepository.findById(dummyArtist.id)
// 		expect(foundArtist).not.toBeNull()
// 		expect(foundArtist!.id).toBe(dummyArtist.id)
// 		expect(foundArtist!.userId).toBe(dummyArtist.userId)
// 		expect(foundArtist!.bio).toBe(dummyArtist.bio)
// 		expect(foundArtist!.user?.name).toBe(dummyUser.name)
// 	})

// 	it('should return null when searching for a non-existent artist by id', async () => {
// 		const foundArtist = await artistRepository.findById('non-existent-id')
// 		expect(foundArtist).toBeNull()
// 	})

// 	it('should find an artist by user id and return the artist', async () => {
// 		const dummyUser = await createDummyUserPrismaORM(prisma)
// 		const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
// 		const foundArtist = await artistRepository.findByUserId(dummyUser.id)
// 		expect(foundArtist).not.toBeNull()
// 		expect(foundArtist!.id).toBe(dummyArtist.id)
// 		expect(foundArtist!.userId).toBe(dummyArtist.userId)
// 		expect(foundArtist!.bio).toBe(dummyArtist.bio)
// 		expect(foundArtist!.user?.name).toBe(dummyUser.name)
// 	})

// 	it('should return null when searching for a non-existent artist by user id', async () => {
// 		const foundArtist = await artistRepository.findByUserId('non-existent-user-id')
// 		expect(foundArtist).toBeNull()
// 	})

// 	it('should list artists with limit and page', async () => {
// 		const dummyUsers = []
// 		const dummyArtists = []
// 		for (let i = 1; i <= 30; i++) {
// 			const dummyUser = await createDummyUserPrismaORM(prisma, {
// 				email: `foo${i}@bar.com`,
// 				name: `Foo ${i}`,
// 			})
// 			dummyUsers.push(dummyUser)
// 			const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
// 			dummyArtists.push(dummyArtist)
// 		}
// 		const artists = await artistRepository.list(1, 15)
// 		expect(artists).toHaveLength(15)
// 	})

// 	it('should update an artist and return the updated artist', async () => {
// 		const dummyUser = await createDummyUserPrismaORM(prisma)
// 		const dummyArtist = await createDummyArtistPrismaORM(prisma, dummyUser.id)
// 		const updatedData = {
// 			bio: 'Updated Bio',
// 		}
// 		const updatedArtist = await artistRepository.update(dummyArtist.id, updatedData)
// 		expect(updatedArtist.id).toBe(dummyArtist.id)
// 		expect(updatedArtist.userId).toBe(dummyArtist.userId)
// 		expect(updatedArtist.bio).toBe(updatedData.bio)
// 		expect(updatedArtist.user?.name).toBe(dummyUser.name)
// 	})
// >>>>>>> bace5aa (refactor: corrige o uso de artists)
// })
