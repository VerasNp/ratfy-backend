import type { TransactionHandle } from '#application/ports/TransactionHandle.js'
import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import ConcurrentUpdateError from '#application/errors/ConcurrentUpdateError.js'
import Artist from '#domain/artist/Artist.js'
import type { Artist as PrismaArtist, PrismaClient, Prisma } from '../../../prisma/generated/prisma/client'

class ArtistRepositoryPrisma implements ArtistRepository {
  constructor(private readonly orm: PrismaClient) {}

  async create(artist: Artist, tx?: TransactionHandle): Promise<Artist> {
    const client = tx ? (tx as unknown as Prisma.TransactionClient) : this.orm
    const row = await client.artist.create({
      data: {
        id:               artist.id,
        userId:           artist.userId,
        bio:              artist.bio,
        profileImageKey:  artist.profileImageKey,
        profileImageSize: artist.profileImageSize,
        createdAt:        artist.createdAt,
      },
    })
    return this.toDomain(row)
  }

  async delete(id: string): Promise<void> {
    await this.orm.artist.delete({
      where: { id },
    })
  }

  async findById(id: string): Promise<Artist | null> {
    const row = await this.orm.artist.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByUserId(userId: string): Promise<Artist | null> {
    const row = await this.orm.artist.findUnique({ where: { userId } })
    return row ? this.toDomain(row) : null
  }

  async listByIds(ids: string[]): Promise<Artist[]> {
    const rows = await this.orm.artist.findMany({
      where: { id: { in: ids } },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async list(page: number, limit: number): Promise<Artist[]> {
    const rows = await this.orm.artist.findMany({
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
    return rows.map((row) => this.toDomain(row))
  }

  async update(id: string, data: Partial<Artist>, expectedProfileImageKey?: string | null): Promise<void> {
    if (expectedProfileImageKey !== undefined) {
      const row = await this.orm.artist.findUnique({
        where: { id },
        select: { profileImageKey: true },
      })
      if (!row || row.profileImageKey !== expectedProfileImageKey) {
        throw new ConcurrentUpdateError('Artist')
      }
    }

    await this.orm.artist.update({
      data: {
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.profileImageKey !== undefined && { profileImageKey: data.profileImageKey }),
        ...(data.profileImageSize !== undefined && { profileImageSize: data.profileImageSize }),
      },
      where: { id },
    })
  }

  private toDomain(row: PrismaArtist): Artist {
    return Artist.restore({
      id:               row.id,
      userId:           row.userId,
      bio:              row.bio,
      profileImageKey:  row.profileImageKey,
      profileImageSize: row.profileImageSize,
      createdAt:        row.createdAt,
      updatedAt:        row.updatedAt,
    })
  }
}

export default ArtistRepositoryPrisma