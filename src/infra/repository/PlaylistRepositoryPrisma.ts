import type { PlaylistRepository } from '#application/ports/PlaylistRepository.js'
import Playlist from '#domain/playlist/Playlist.js'
import type { Playlist as PrismaPlaylist, PrismaClient } from '../../../prisma/generated/prisma/client'

class PlaylistRepositoryPrisma implements PlaylistRepository {
  constructor(private readonly orm: PrismaClient) {}

  async create(playlist: Playlist): Promise<Playlist> {
    const row = await this.orm.playlist.create({
      data: {
        id:        playlist.id,
        name:      playlist.name,
        isPublic:  playlist.isPublic,
        ownerId:   playlist.ownerId,
        createdAt: playlist.createdAt,
      },
    })
    return this.toDomain(row)
  }

  async delete(id: string): Promise<void> {
    await this.orm.playlist.delete({
      where: { id },
    })
  }

  async findById(id: string): Promise<Playlist | null> {
    const row = await this.orm.playlist.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async listByIds(ids: string[]): Promise<Playlist[]> {
    const rows = await this.orm.playlist.findMany({
      where: { id: { in: ids } },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async listByOwnerId(ownerId: string, page: number, limit: number): Promise<Playlist[]> {
    const rows = await this.orm.playlist.findMany({
      where:   { ownerId },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
    return rows.map((row) => this.toDomain(row))
  }

  async list(page: number, limit: number): Promise<Playlist[]> {
    const rows = await this.orm.playlist.findMany({
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })

    return rows.map((row) => this.toDomain(row)) 
  }

  async update(id: string, data: Partial<Playlist>): Promise<void> {
    await this.orm.playlist.update({
      data: {

        ...(data.name !== undefined && { name: data.name }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
      where: { id },
    })
  }

  async addTrack(playlistId: string, trackId: string): Promise<void> {
    await this.orm.playlist.update({
      where: { id: playlistId },
      data: {
        tracks: {
          connect: { id: trackId },
        },
      },
    })
  }

  async removeTrack(playlistId: string, trackId: string): Promise<void> {
    await this.orm.playlist.update({
      where: { id: playlistId },
      data: {
        tracks: {
          disconnect: { id: trackId },
        },
      },
    })
  }

  private toDomain(row: PrismaPlaylist): Playlist {
    return Playlist.restore({
      id:        row.id,
      name:      row.name,
      isPublic:  row.isPublic,
      ownerId:   row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}

export default PlaylistRepositoryPrisma