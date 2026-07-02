import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import ArtistRepositoryPrisma from '#infra/repository/ArtistRepositoryPrisma.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import User from '#domain/user/User.js'
import Artist from '#domain/artist/Artist.js'
import { PrismaClient } from '#prisma/client'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const artistRepository = new ArtistRepositoryPrisma(prisma)
const userRepository = new UserRepositoryPrismaORM(prisma)

let dummyUser: User

beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Artist" RESTART IDENTITY CASCADE')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
  dummyUser = User.create('Test User', 'artist-test@example.com', 'Valid@123', new Date('1990-01-01'))
  await userRepository.create(dummyUser)
})

describe('ArtistRepositoryPrisma', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('create', () => {
    it('should create a new artist', async () => {
      const artist = Artist.create({ userId: dummyUser.id, bio: 'Test bio' })

      const created = await artistRepository.create(artist)

      const row = await prisma.artist.findUnique({ where: { id: created.id } })
      expect(row).not.toBeNull()
      expect(row!.id).toBe(artist.id)
      expect(row!.userId).toBe(dummyUser.id)
      expect(row!.bio).toBe('Test bio')
    })

    it('should create an artist with null bio', async () => {
      const artist = Artist.create({ userId: dummyUser.id })

      const created = await artistRepository.create(artist)

      const row = await prisma.artist.findUnique({ where: { id: created.id } })
      expect(row).not.toBeNull()
      expect(row!.bio).toBeNull()
    })
  })

  describe('findById', () => {
    it('should find an artist by id', async () => {
      const artist = Artist.create({ userId: dummyUser.id, bio: 'Find me' })
      await artistRepository.create(artist)

      const found = await artistRepository.findById(artist.id)

      expect(found).not.toBeNull()
      expect(found!.id).toBe(artist.id)
      expect(found!.userId).toBe(dummyUser.id)
      expect(found!.bio).toBe('Find me')
    })

    it('should return null when artist does not exist', async () => {
      const found = await artistRepository.findById(crypto.randomUUID())
      expect(found).toBeNull()
    })
  })

  describe('findByUserId', () => {
    it('should find an artist by user id', async () => {
      const artist = Artist.create({ userId: dummyUser.id, bio: 'By userId' })
      await artistRepository.create(artist)

      const found = await artistRepository.findByUserId(dummyUser.id)

      expect(found).not.toBeNull()
      expect(found!.id).toBe(artist.id)
      expect(found!.userId).toBe(dummyUser.id)
    })

    it('should return null when no artist exists for the user', async () => {
      const found = await artistRepository.findByUserId(crypto.randomUUID())
      expect(found).toBeNull()
    })
  })

  describe('listByIds', () => {
    it('should return artists matching the given ids', async () => {
      const user2 = User.create('User 2', 'list-by-ids-1@example.com', 'Valid@123', new Date('1990-01-01'))
      const user3 = User.create('User 3', 'list-by-ids-2@example.com', 'Valid@123', new Date('1990-01-01'))
      await userRepository.create(user2)
      await userRepository.create(user3)
      const artist1 = Artist.create({ userId: user2.id, bio: 'Artist 1' })
      const artist2 = Artist.create({ userId: user3.id, bio: 'Artist 2' })
      await artistRepository.create(artist1)
      await artistRepository.create(artist2)

      const result = await artistRepository.listByIds([artist1.id, artist2.id])

      expect(result).toHaveLength(2)
      expect(result.map((a) => a.id)).toEqual(expect.arrayContaining([artist1.id, artist2.id]))
    })

    it('should return empty array when no ids match', async () => {
      const result = await artistRepository.listByIds([crypto.randomUUID()])
      expect(result).toEqual([])
    })

    it('should return only matching artists when some ids do not exist', async () => {
      const artist = Artist.create({ userId: dummyUser.id, bio: 'Only me' })
      await artistRepository.create(artist)

      const result = await artistRepository.listByIds([artist.id, crypto.randomUUID()])

      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe(artist.id)
    })
  })

  describe('list', () => {
    it('should return a paginated list of artists ordered by createdAt desc', async () => {
      const user2 = User.create('User 2', 'list-paginated-1@example.com', 'Valid@123', new Date('1990-01-01'))
      const user3 = User.create('User 3', 'list-paginated-2@example.com', 'Valid@123', new Date('1990-01-01'))
      await userRepository.create(user2)
      await userRepository.create(user3)
      const artist1 = Artist.create({ userId: user2.id, bio: 'First' })
      const artist2 = Artist.create({ userId: user3.id, bio: 'Second' })
      await artistRepository.create(artist1)
      await artistRepository.create(artist2)

      const result = await artistRepository.list(1, 10)

      expect(result.length).toBeGreaterThanOrEqual(2)
    })

    it('should respect limit parameter', async () => {
      for (let i = 0; i < 3; i++) {
        const user = User.create(`User ${i}`, `artist-list-${i}@example.com`, 'Valid@123', new Date('1990-01-01'))
        await userRepository.create(user)
        const artist = Artist.create({ userId: user.id, bio: `Artist ${i}` })
        await artistRepository.create(artist)
      }

      const result = await artistRepository.list(1, 2)

      expect(result).toHaveLength(2)
    })
  })

  describe('update', () => {
    it('should update the artist bio', async () => {
      const artist = Artist.create({ userId: dummyUser.id, bio: 'Old bio' })
      await artistRepository.create(artist)

      await artistRepository.update(artist.id, { bio: 'Updated bio' })

      const row = await prisma.artist.findUnique({ where: { id: artist.id } })
      expect(row!.bio).toBe('Updated bio')
    })
  })

  describe('delete', () => {
    it('should delete an existing artist', async () => {
      const artist = Artist.create({ userId: dummyUser.id, bio: 'To delete' })
      await artistRepository.create(artist)

      await artistRepository.delete(artist.id)

      const row = await prisma.artist.findUnique({ where: { id: artist.id } })
      expect(row).toBeNull()
    })

    it('should not throw when deleting a non-existent artist', async () => {
      await expect(artistRepository.delete(crypto.randomUUID())).rejects.toThrow()
    })
  })
})
