import type { TrackRepository } from '#application/ports/TrackRepository.js'

import { TrackNotFoundError }   from '#application/errors/TrackNotFoundError.js'
import Track, { type ExternalIds } from '#domain/track/Track.js'

import type { PrismaClient, Track as PrismaTrack } from '../../../prisma/generated/prisma/client'



class TrackRepositoryPrisma implements TrackRepository {
  constructor(private readonly orm: PrismaClient) { }
  async create(track: Track): Promise<Track> {
    const row = await this.orm.track.create({
      data: {
        albumId:     track.albumId,
        artistIds:   track.artistIds,
        createdAt:   track.createdAt,
        discNumber:  track.discNumber,
        durationMs:  track.durationMs,
        explicit:    track.explicit,
        externalIds: track.externalIds,
        id:          track.id,
        isDeleted:   track.isDeleted,
        isLocal:     track.isLocal,
        isPublic:    track.isPublic,
        name:        track.name,
        popularity:  track.popularity,
        trackNumber: track.trackNumber,
      },
    })
    return this.toDomain(row)
  }
  async delete(id: string): Promise<void> {
    await this.orm.track.update({
      data:  { isDeleted: true, isPublic: false },
      where: { id },
    })
  }
  async findByAlbumId(albumId: string): Promise<Track[]> {
    const rows = await this.orm.track.findMany({
      orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
      where:   { albumId, isDeleted: false },
    })
    return rows.map((row) => this.toDomain(row))
  }
  async findById(id: string): Promise<Track | null> {
    const row = await this.orm.track.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }



  async listByIds(ids: string[]): Promise<Track[]> {
    const rows = await this.orm.track.findMany({
      where: { id: { in: ids }, isDeleted: false },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async list(page: number, limit: number): Promise<Track[]> {
    const rows = await this.orm.track.findMany({
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      where:   { isDeleted: false },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async update(id: string, data: Partial<Track>): Promise<void> {
    await this.orm.track.update({
      data: {
        ...(data.albumId      != null && { albumId:     data.albumId }),
        ...(data.artistIds    != null && { artistIds:   data.artistIds }),
        ...(data.discNumber   != null && { discNumber:  data.discNumber }),
        ...(data.durationMs   != null && { durationMs:  data.durationMs }),
        ...(data.explicit     != null && { explicit:    data.explicit }),
        ...(data.externalIds  != null && { externalIds: data.externalIds }),
        ...(data.isLocal      != null && { isLocal:     data.isLocal }),
        ...(data.isPublic     != null && { isPublic:    data.isPublic }),
        ...(data.name         != null && { name:        data.name }),
        ...(data.popularity   != null && { popularity:  data.popularity }),
        ...(data.trackNumber  != null && { trackNumber: data.trackNumber }),
      },
      where: { id },
    })
  }
  private toDomain(row: PrismaTrack): Track {
    return Track.restore({
      albumId:     row.albumId,
      artistIds:   row.artistIds,
      createdAt:   row.createdAt,
      discNumber:  row.discNumber,
      durationMs:  row.durationMs,
      explicit:    row.explicit,
      externalIds: row.externalIds as ExternalIds,
      id:          row.id,
      isDeleted:   row.isDeleted,
      isLocal:     row.isLocal,
      isPublic:    row.isPublic,
      name:        row.name,
      popularity:  row.popularity,
      trackNumber: row.trackNumber,
      updatedAt:   row.updatedAt,
    })
  }



}

export default TrackRepositoryPrisma
