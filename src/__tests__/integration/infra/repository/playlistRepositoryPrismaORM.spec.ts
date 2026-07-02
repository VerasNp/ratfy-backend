import { afterAll, beforeEach, describe, expect, inject, it } from 'vitest'
import { PrismaPg } from '@prisma/adapter-pg'
import PlaylistRepositoryPrisma from '#infra/repository/PlaylistRepositoryPrisma.js'
import UserRepositoryPrismaORM from '#infra/repository/UserRepositoryPrismaORM.js'
import User from '#domain/user/User.js'
import Playlist from '#domain/playlist/Playlist.js'
import { PrismaClient } from '#prisma/client'

const adapter = new PrismaPg({ connectionString: inject('testPostgresURL') })
const prisma = new PrismaClient({ adapter })

const playlistRepository = new PlaylistRepositoryPrisma(prisma)
const userRepository = new UserRepositoryPrismaORM(prisma)

let dummyUser: User

beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "_PlaylistToTrack" RESTART IDENTITY CASCADE')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Playlist" RESTART IDENTITY CASCADE')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Track" RESTART IDENTITY CASCADE')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Album" RESTART IDENTITY CASCADE')
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE')
  dummyUser = User.create('Test User', 'playlist-test@example.com', 'Valid@123', new Date('1990-01-01'))
  await userRepository.create(dummyUser)
})

describe('PlaylistRepositoryPrisma', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('create', () => {
    it('should create a new playlist', async () => {
      const playlist = Playlist.create({ name: 'My Playlist', ownerId: dummyUser.id })

      const created = await playlistRepository.create(playlist)

      const row = await prisma.playlist.findUnique({ where: { id: created.id } })
      expect(row).not.toBeNull()
      expect(row!.id).toBe(playlist.id)
      expect(row!.name).toBe('My Playlist')
      expect(row!.isPublic).toBe(true)
      expect(row!.ownerId).toBe(dummyUser.id)
    })

    it('should create a private playlist', async () => {
      const playlist = Playlist.create({ name: 'Private', ownerId: dummyUser.id, isPublic: false })

      const created = await playlistRepository.create(playlist)

      const row = await prisma.playlist.findUnique({ where: { id: created.id } })
      expect(row).not.toBeNull()
      expect(row!.isPublic).toBe(false)
    })
  })

  describe('findById', () => {
    it('should find a playlist by id', async () => {
      const playlist = Playlist.create({ name: 'Find Me', ownerId: dummyUser.id })
      await playlistRepository.create(playlist)

      const found = await playlistRepository.findById(playlist.id)

      expect(found).not.toBeNull()
      expect(found!.id).toBe(playlist.id)
      expect(found!.name).toBe('Find Me')
      expect(found!.ownerId).toBe(dummyUser.id)
    })

    it('should return null when playlist does not exist', async () => {
      const found = await playlistRepository.findById(crypto.randomUUID())
      expect(found).toBeNull()
    })
  })

  describe('listByIds', () => {
    it('should return playlists matching the given ids', async () => {
      const p1 = Playlist.create({ name: 'List 1', ownerId: dummyUser.id })
      const p2 = Playlist.create({ name: 'List 2', ownerId: dummyUser.id })
      await playlistRepository.create(p1)
      await playlistRepository.create(p2)

      const result = await playlistRepository.listByIds([p1.id, p2.id])

      expect(result).toHaveLength(2)
      expect(result.map((p) => p.id)).toEqual(expect.arrayContaining([p1.id, p2.id]))
    })

    it('should return empty array when no ids match', async () => {
      const result = await playlistRepository.listByIds([crypto.randomUUID()])
      expect(result).toEqual([])
    })

    it('should return only matching playlists when some ids do not exist', async () => {
      const p1 = Playlist.create({ name: 'Only Me', ownerId: dummyUser.id })
      await playlistRepository.create(p1)

      const result = await playlistRepository.listByIds([p1.id, crypto.randomUUID()])

      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe(p1.id)
    })
  })

  describe('listByOwnerId', () => {
    it('should return playlists owned by the given user', async () => {
      const user2 = User.create('User 2', 'owner-test@example.com', 'Valid@123', new Date('1990-01-01'))
      await userRepository.create(user2)
      const p1 = Playlist.create({ name: 'Owner 1', ownerId: dummyUser.id })
      const p2 = Playlist.create({ name: 'Owner 2', ownerId: dummyUser.id })
      const p3 = Playlist.create({ name: 'Other', ownerId: user2.id })
      await playlistRepository.create(p1)
      await playlistRepository.create(p2)
      await playlistRepository.create(p3)

      const result = await playlistRepository.listByOwnerId(dummyUser.id, 1, 10)

      expect(result).toHaveLength(2)
      expect(result.map((p) => p.id)).toEqual(expect.arrayContaining([p1.id, p2.id]))
    })

    it('should return empty array for user with no playlists', async () => {
      const result = await playlistRepository.listByOwnerId(crypto.randomUUID(), 1, 10)
      expect(result).toEqual([])
    })

    it('should respect pagination', async () => {
      for (let i = 0; i < 5; i++) {
        const p = Playlist.create({ name: `Page ${i}`, ownerId: dummyUser.id })
        await playlistRepository.create(p)
      }

      const page1 = await playlistRepository.listByOwnerId(dummyUser.id, 1, 2)
      expect(page1).toHaveLength(2)
    })
  })

  describe('list', () => {
    it('should return a paginated list of all playlists ordered by createdAt desc', async () => {
      const p1 = Playlist.create({ name: 'First', ownerId: dummyUser.id })
      const p2 = Playlist.create({ name: 'Second', ownerId: dummyUser.id })
      await playlistRepository.create(p1)
      await playlistRepository.create(p2)

      const result = await playlistRepository.list(1, 10)

      expect(result.length).toBeGreaterThanOrEqual(2)
    })

    it('should respect limit parameter', async () => {
      for (let i = 0; i < 3; i++) {
        const p = Playlist.create({ name: `Batch ${i}`, ownerId: dummyUser.id })
        await playlistRepository.create(p)
      }

      const result = await playlistRepository.list(1, 2)

      expect(result).toHaveLength(2)
    })
  })

  describe('update', () => {
    it('should update the playlist name', async () => {
      const playlist = Playlist.create({ name: 'Old Name', ownerId: dummyUser.id })
      await playlistRepository.create(playlist)

      await playlistRepository.update(playlist.id, { name: 'New Name' })

      const row = await prisma.playlist.findUnique({ where: { id: playlist.id } })
      expect(row!.name).toBe('New Name')
    })

    it('should update isPublic', async () => {
      const playlist = Playlist.create({ name: 'Toggle', ownerId: dummyUser.id })
      await playlistRepository.create(playlist)

      await playlistRepository.update(playlist.id, { isPublic: false })

      const row = await prisma.playlist.findUnique({ where: { id: playlist.id } })
      expect(row!.isPublic).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete an existing playlist', async () => {
      const playlist = Playlist.create({ name: 'To Delete', ownerId: dummyUser.id })
      await playlistRepository.create(playlist)

      await playlistRepository.delete(playlist.id)

      const row = await prisma.playlist.findUnique({ where: { id: playlist.id } })
      expect(row).toBeNull()
    })

    it('should throw when deleting a non-existent playlist', async () => {
      await expect(playlistRepository.delete(crypto.randomUUID())).rejects.toThrow()
    })
  })

  describe('addTrack', () => {
    it('should connect a track to the playlist', async () => {
      const album = await prisma.album.create({
        data: {
          id:               crypto.randomUUID(),
          name:             'Test Album',
          albumType:        'album',
          releaseDate:      '2024-01-01',
          releasePrecision: 'day',
          totalTracks:      1,
          label:            'Test Label',
          artistIds:        [],
        },
      })
      const track = await prisma.track.create({
        data: {
          id:          crypto.randomUUID(),
          title:       'Test Track',
          durationMs:  200000,
          discNumber:  1,
          trackNumber: 1,
          explicit:    false,
          albumId:     album.id,
        },
      })
      const playlist = Playlist.create({ name: 'Add Track', ownerId: dummyUser.id })
      await playlistRepository.create(playlist)

      await playlistRepository.addTrack(playlist.id, track.id)

      const rows = await prisma.$queryRawUnsafe<{ B: string }[]>(
        'SELECT "B" FROM "_PlaylistToTrack" WHERE "A" = $1',
        playlist.id,
      )
      expect(rows).toHaveLength(1)
      expect(rows[0]!.B).toBe(track.id)
    })
  })

  describe('removeTrack', () => {
    it('should disconnect a track from the playlist', async () => {
      const album = await prisma.album.create({
        data: {
          id:               crypto.randomUUID(),
          name:             'Test Album',
          albumType:        'album',
          releaseDate:      '2024-01-01',
          releasePrecision: 'day',
          totalTracks:      1,
          label:            'Test Label',
          artistIds:        [],
        },
      })
      const track = await prisma.track.create({
        data: {
          id:          crypto.randomUUID(),
          title:       'Test Track',
          durationMs:  200000,
          discNumber:  1,
          trackNumber: 1,
          explicit:    false,
          albumId:     album.id,
        },
      })
      const playlist = Playlist.create({ name: 'Remove Track', ownerId: dummyUser.id })
      await playlistRepository.create(playlist)
      await playlistRepository.addTrack(playlist.id, track.id)

      await playlistRepository.removeTrack(playlist.id, track.id)

      const rows = await prisma.$queryRawUnsafe<{ B: string }[]>(
        'SELECT "B" FROM "_PlaylistToTrack" WHERE "A" = $1',
        playlist.id,
      )
      expect(rows).toHaveLength(0)
    })

    it('should not throw when disconnecting a non-existent track', async () => {
      const playlist = Playlist.create({ name: 'No Track', ownerId: dummyUser.id })
      await playlistRepository.create(playlist)

      await expect(
        playlistRepository.removeTrack(playlist.id, crypto.randomUUID()),
      ).resolves.toBeUndefined()
    })
  })
})
