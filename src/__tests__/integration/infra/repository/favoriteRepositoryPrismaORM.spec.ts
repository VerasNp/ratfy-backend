import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import FavoriteRepositoryPrisma from '#infra/repository/FavoriteRepositoryPrisma.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import User from '#domain/user/User.js'
import { PrismaClient } from '#prisma/client'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })
const userRepository = new UserRepositoryPrismaORM(prisma)
const favoriteRepository = new FavoriteRepositoryPrisma(prisma)

let dummyUser: User

beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Favorite" RESTART IDENTITY CASCADE')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
  dummyUser = User.create('Test User', 'test@example.com', 'Valid@123', new Date('1990-01-01'))
  await userRepository.create(dummyUser)
})

describe('FavoriteRepositoryPrisma', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('add', () => {
    it('should create a new favorite for a track', async () => {
      const entityId = 'track-1'

      await favoriteRepository.add(dummyUser.id, entityId, 'TRACK')

      const row = await prisma.favorite.findUnique({
        where: {
          userId_entityId_entityType: { userId: dummyUser.id, entityId, entityType: 'TRACK' },
        },
      })
      expect(row).not.toBeNull()
      expect(row!.userId).toBe(dummyUser.id)
      expect(row!.entityId).toBe(entityId)
      expect(row!.entityType).toBe('TRACK')
    })

    it('should create a new favorite for an artist', async () => {
      const entityId = 'artist-1'

      await favoriteRepository.add(dummyUser.id, entityId, 'ARTIST')

      const row = await prisma.favorite.findUnique({
        where: {
          userId_entityId_entityType: { userId: dummyUser.id, entityId, entityType: 'ARTIST' },
        },
      })
      expect(row).not.toBeNull()
      expect(row!.userId).toBe(dummyUser.id)
      expect(row!.entityId).toBe(entityId)
      expect(row!.entityType).toBe('ARTIST')
    })

    it('should be idempotent when adding the same favorite twice', async () => {
      const entityId = 'track-1'

      await favoriteRepository.add(dummyUser.id, entityId, 'TRACK')
      await favoriteRepository.add(dummyUser.id, entityId, 'TRACK')

      const rows = await prisma.favorite.findMany({
        where: { userId: dummyUser.id, entityId, entityType: 'TRACK' },
      })
      expect(rows).toHaveLength(1)
    })
  })

  describe('remove', () => {
    it('should remove an existing track favorite', async () => {
      const entityId = 'track-1'
      await favoriteRepository.add(dummyUser.id, entityId, 'TRACK')

      await favoriteRepository.remove(dummyUser.id, entityId, 'TRACK')

      const row = await prisma.favorite.findUnique({
        where: {
          userId_entityId_entityType: { userId: dummyUser.id, entityId, entityType: 'TRACK' },
        },
      })
      expect(row).toBeNull()
    })

    it('should remove an existing artist favorite', async () => {
      const entityId = 'artist-1'
      await favoriteRepository.add(dummyUser.id, entityId, 'ARTIST')

      await favoriteRepository.remove(dummyUser.id, entityId, 'ARTIST')

      const row = await prisma.favorite.findUnique({
        where: {
          userId_entityId_entityType: { userId: dummyUser.id, entityId, entityType: 'ARTIST' },
        },
      })
      expect(row).toBeNull()
    })

    it('should not throw when removing a non-existent favorite', async () => {
      await expect(
        favoriteRepository.remove(dummyUser.id, 'nonexistent', 'TRACK'),
      ).resolves.toBeUndefined()
    })
  })

  describe('findEntityIdsByUserAndType', () => {
    it('should return empty array when user has no favorites', async () => {
      const ids = await favoriteRepository.findEntityIdsByUserAndType(dummyUser.id, 'TRACK')

      expect(ids).toEqual([])
    })

    it('should return only entity IDs matching the given user and type for tracks', async () => {
      await favoriteRepository.add(dummyUser.id, 'track-1', 'TRACK')
      await favoriteRepository.add(dummyUser.id, 'track-2', 'TRACK')
      await favoriteRepository.add(dummyUser.id, 'album-1', 'ALBUM')

      const ids = await favoriteRepository.findEntityIdsByUserAndType(dummyUser.id, 'TRACK')

      expect(ids).toEqual(['track-1', 'track-2'])
    })

    it('should return only artist IDs when filtering by ARTIST type', async () => {
      await favoriteRepository.add(dummyUser.id, 'artist-1', 'ARTIST')
      await favoriteRepository.add(dummyUser.id, 'artist-2', 'ARTIST')
      await favoriteRepository.add(dummyUser.id, 'track-1', 'TRACK')

      const ids = await favoriteRepository.findEntityIdsByUserAndType(dummyUser.id, 'ARTIST')

      expect(ids).toEqual(['artist-1', 'artist-2'])
    })
  })

  describe('isFavorited', () => {
    it('should return true when a track is favorited', async () => {
      const entityId = 'track-1'
      await favoriteRepository.add(dummyUser.id, entityId, 'TRACK')

      const result = await favoriteRepository.isFavorited(dummyUser.id, entityId, 'TRACK')

      expect(result).toBe(true)
    })

    it('should return true when an artist is favorited', async () => {
      const entityId = 'artist-1'
      await favoriteRepository.add(dummyUser.id, entityId, 'ARTIST')

      const result = await favoriteRepository.isFavorited(dummyUser.id, entityId, 'ARTIST')

      expect(result).toBe(true)
    })

    it('should return false when entity is not favorited', async () => {
      const result = await favoriteRepository.isFavorited(dummyUser.id, 'track-1', 'TRACK')

      expect(result).toBe(false)
    })
  })

  describe('removeAllByEntity', () => {
    it('should remove all favorites for a given entity and type', async () => {
      await favoriteRepository.add(dummyUser.id, 'track-1', 'TRACK')
      await favoriteRepository.add(dummyUser.id, 'track-1', 'ALBUM')

      await favoriteRepository.removeAllByEntity('track-1', 'TRACK')

      const trackFav = await prisma.favorite.findMany({ where: { entityId: 'track-1', entityType: 'TRACK' } })
      const albumFav = await prisma.favorite.findMany({ where: { entityId: 'track-1', entityType: 'ALBUM' } })
      expect(trackFav).toHaveLength(0)
      expect(albumFav).toHaveLength(1)
    })

    it('should remove all artist favorites for a given entity', async () => {
      await favoriteRepository.add(dummyUser.id, 'artist-1', 'ARTIST')
      await favoriteRepository.add(dummyUser.id, 'artist-1', 'ALBUM')

      await favoriteRepository.removeAllByEntity('artist-1', 'ARTIST')

      const artistFav = await prisma.favorite.findMany({ where: { entityId: 'artist-1', entityType: 'ARTIST' } })
      const albumFav = await prisma.favorite.findMany({ where: { entityId: 'artist-1', entityType: 'ALBUM' } })
      expect(artistFav).toHaveLength(0)
      expect(albumFav).toHaveLength(1)
    })

    it('should not affect other entities', async () => {
      await favoriteRepository.add(dummyUser.id, 'track-1', 'TRACK')
      await favoriteRepository.add(dummyUser.id, 'track-2', 'TRACK')

      await favoriteRepository.removeAllByEntity('track-1', 'TRACK')

      const remaining = await prisma.favorite.findMany({ where: { entityType: 'TRACK' } })
      expect(remaining).toHaveLength(1)
      expect(remaining[0]!.entityId).toBe('track-2')
    })
  })
})
