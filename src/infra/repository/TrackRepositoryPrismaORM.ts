import type { TrackRepository } from '#application/ports/TrackRepository.js'

import ConcurrentUpdateError from '#application/errors/ConcurrentUpdateError.js'
import { TrackNotFoundError } from '#application/errors/TrackNotFoundError.js'
import Track, { type ExternalIds } from '#domain/track/Track.js'

import type { PrismaClient, Track as PrismaTrack } from '../../../prisma/generated/prisma/client'



class TrackRepositoryPrisma implements TrackRepository {
  constructor(private readonly orm: PrismaClient) { }
  async create(track: Track): Promise<Track> {
    const row = await this.orm.track.create({
      data: {
        albumId:           track.albumId,
        artistIds:         track.artistIds,
        audioFileKey:      track.audioFileKey,
        audioFileSize:     track.audioFileSize,
        audioContentType:  track.audioContentType,
        createdAt:         track.createdAt,
        discNumber:        track.discNumber,
        drmEnabled:        track.drmEnabled,
        durationMs:        track.durationMs,
        explicit:          track.explicit,
        externalIds:       track.externalIds,
        id:                track.id,
        isDeleted:         track.isDeleted,
        isLocal:           track.isLocal,
        isPublic:          track.isPublic,
        name:              track.name,
        popularity:        track.popularity,
        trackNumber:       track.trackNumber,
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



  async list(page: number, limit: number): Promise<Track[]> {
    const rows = await this.orm.track.findMany({
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      where:   { isDeleted: false },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async update(id: string, data: Partial<Track>, expectedAudioFileKey?: string | null): Promise<void> {
    const where: any = { id }
    if (expectedAudioFileKey !== undefined) {
      where.audioFileKey = expectedAudioFileKey
      const result = await this.orm.track.updateMany({
        data: {
          ...(data.albumId           != null && { albumId:           data.albumId }),
          ...(data.artistIds         != null && { artistIds:         data.artistIds }),
          ...(data.audioFileKey      != null && { audioFileKey:      data.audioFileKey }),
          ...(data.audioFileSize     != null && { audioFileSize:     data.audioFileSize }),
          ...(data.audioContentType  != null && { audioContentType:  data.audioContentType }),
          ...(data.discNumber        != null && { discNumber:        data.discNumber }),
          ...(data.drmEnabled        != null && { drmEnabled:        data.drmEnabled }),
          ...(data.durationMs        != null && { durationMs:        data.durationMs }),
          ...(data.explicit          != null && { explicit:          data.explicit }),
          ...(data.externalIds       != null && { externalIds:       data.externalIds }),
          ...(data.isLocal           != null && { isLocal:           data.isLocal }),
          ...(data.isPublic          != null && { isPublic:          data.isPublic }),
          ...(data.name              != null && { name:              data.name }),
          ...(data.popularity        != null && { popularity:        data.popularity }),
        },
        where,
      })
      if (result.count === 0) {
        throw new ConcurrentUpdateError('Track')
      }
      return
    }

    await this.orm.track.update({
      data: {
        ...(data.albumId           != null && { albumId:           data.albumId }),
        ...(data.artistIds         != null && { artistIds:         data.artistIds }),
        ...(data.audioFileKey      != null && { audioFileKey:      data.audioFileKey }),
        ...(data.audioFileSize     != null && { audioFileSize:     data.audioFileSize }),
        ...(data.audioContentType  != null && { audioContentType:  data.audioContentType }),
        ...(data.discNumber        != null && { discNumber:        data.discNumber }),
        ...(data.drmEnabled        != null && { drmEnabled:        data.drmEnabled }),
        ...(data.durationMs        != null && { durationMs:        data.durationMs }),
        ...(data.explicit          != null && { explicit:          data.explicit }),
        ...(data.externalIds       != null && { externalIds:       data.externalIds }),
        ...(data.isLocal           != null && { isLocal:           data.isLocal }),
        ...(data.isPublic          != null && { isPublic:          data.isPublic }),
        ...(data.name              != null && { name:              data.name }),
        ...(data.popularity        != null && { popularity:        data.popularity }),
      },
      where: { id },
    })
  }
  private toDomain(row: PrismaTrack): Track {
    return Track.restore({
      albumId:           row.albumId,
      artistIds:         row.artistIds,
      audioFileKey:      row.audioFileKey,
      audioFileSize:     row.audioFileSize,
      audioContentType:  row.audioContentType,
      createdAt:         row.createdAt,
      discNumber:        row.discNumber,
      drmEnabled:        row.drmEnabled,
      durationMs:        row.durationMs,
      explicit:          row.explicit,
      externalIds:       row.externalIds as ExternalIds,
      id:                row.id,
      isDeleted:         row.isDeleted,
      isLocal:           row.isLocal,
      isPublic:          row.isPublic,
      name:              row.name,
      popularity:        row.popularity,
      trackNumber:       row.trackNumber,
      updatedAt:         row.updatedAt,
    })
  }



}

export default TrackRepositoryPrisma
