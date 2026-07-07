import ConcurrentUpdateError from '#application/errors/ConcurrentUpdateError.js'
import type { TrackRepository } from '#application/ports/TrackRepository.js'
import Track from '#domain/track/Track.js'
import { Prisma, type PrismaClient } from '#prisma/client'

class TrackRepositoryPrismaORM implements TrackRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async search(input: { page: number; limit: number; query?: string }): Promise<Track[]> {
		const { page, limit, query } = input
		const rows = await this.orm.track.findMany({
			where: {
				deletedAt: null,
				...(query && {
					title: { contains: query, mode: 'insensitive' },
				}),
			},
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
		})
		return rows.map((row) => this._toDomain(row))
	}

	public async create(trackData: Track): Promise<Track> {
		const row = await this.orm.track.create({
			data: {
				id: trackData.id,
				title: trackData.title,
				durationMs: trackData.durationMs,
				discNumber: trackData.discNumber,
				trackNumber: trackData.trackNumber,
				explicit: trackData.explicit,
				lyrics: trackData.lyrics,
				isPublic: trackData.isPublic,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
				audioFileKey: trackData.audioFileKey,
				audioFileSize: trackData.audioFileSize,
				audioContentType: trackData.audioContentType,
				drmEnabled: trackData.drmEnabled,
				album: {
					connect: { id: trackData.albumId },
				},
				...(trackData.artists.length > 0 && {
					artists: {
						connect: trackData.artists.map((artist) => ({ id: artist.id })),
					},
				}),
			},
			include: { album: true, artists: true },
		})
		return this._toDomain(row)
	}

	public async delete(trackId: string): Promise<void> {
		await this.orm.track.update({
			data: { deletedAt: new Date(), isPublic: false },
			where: { id: trackId },
		})
	}

	public async findByAlbumId(albumId: string): Promise<Track[]> {
		const rows = await this.orm.track.findMany({
			orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
			where: { albumId, deletedAt: null },
		})
		return rows.map((row) => this._toDomain(row))
	}

	public async findById(trackId: string): Promise<Track | null> {
		const row = await this.orm.track.findUnique({
			where: { id: trackId, deletedAt: null },
			include: { album: true, artists: true },
		})
		return row ? this._toDomain(row) : null
	}

	public async listByIds(ids: string[]): Promise<Track[]> {
		const rows = await this.orm.track.findMany({
			where: { id: { in: ids }, deletedAt: null },
		})
		return rows.map((row) => this._toDomain(row))
	}

	public async list(page: number, limit: number): Promise<Track[]> {
		const rows = await this.orm.track.findMany({
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
			where: { deletedAt: null },
		})
		return rows.map((row) => this._toDomain(row))
	}

	public async update(
		id: string,
		data: Partial<Track>,
		expectedAudioFileKey?: string | null,
	): Promise<Track | null> {
		const where: any = { id }
		let row: any
		try {
			if (expectedAudioFileKey !== undefined) {
				where.audioFileKey = expectedAudioFileKey
				row = await this.orm.track.update({
					data: {
						...(data.title != null && { title: data.title }),
						...(data.durationMs != null && { durationMs: data.durationMs }),
						...(data.discNumber != null && { discNumber: data.discNumber }),
						...(data.trackNumber != null && { trackNumber: data.trackNumber }),
						...(data.explicit != null && { explicit: data.explicit }),
						...(data.lyrics != null && { lyrics: data.lyrics }),
						...(data.isPublic != null && { isPublic: data.isPublic }),
						...(data.albumId != null && { albumId: data.albumId }),
						...(data.audioFileKey != null && { audioFileKey: data.audioFileKey }),
						...(data.audioFileSize != null && { audioFileSize: data.audioFileSize }),
						...(data.audioContentType != null && {
							audioContentType: data.audioContentType,
						}),
						...(data.drmEnabled != null && { drmEnabled: data.drmEnabled }),
						...(data.artists != null && {
							artists: {
								set: data.artists.map((artist) => ({ id: artist.id })),
							},
						}),
						updatedAt: new Date(),
					},
					where,
					include: { album: true, artists: true },
				})
				if (row.count === 0) {
					throw new ConcurrentUpdateError('Track')
				}
			} else {
				row = await this.orm.track.update({
					data: {
						...(data.title != null && { title: data.title }),
						...(data.durationMs != null && { durationMs: data.durationMs }),
						...(data.discNumber != null && { discNumber: data.discNumber }),
						...(data.trackNumber != null && { trackNumber: data.trackNumber }),
						...(data.explicit != null && { explicit: data.explicit }),
						...(data.lyrics != null && { lyrics: data.lyrics }),
						...(data.isPublic != null && { isPublic: data.isPublic }),
						...(data.albumId != null && { albumId: data.albumId }),
						...(data.audioFileKey != null && { audioFileKey: data.audioFileKey }),
						...(data.audioFileSize != null && { audioFileSize: data.audioFileSize }),
						...(data.audioContentType != null && {
							audioContentType: data.audioContentType,
						}),
						...(data.drmEnabled != null && { drmEnabled: data.drmEnabled }),
						...(data.artists != null && {
							artists: {
								set: data.artists.map((artist) => ({ id: artist.id })),
							},
						}),
						updatedAt: new Date(),
					},
					where,
					include: { album: true, artists: true },
				})
			}
			return this._toDomain(row)
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}
	private _toDomain(row: any): Track {
		return Track.restore({
			albumId: row.albumId,
			createdAt: row.createdAt,
			discNumber: row.discNumber,
			durationMs: row.durationMs,
			explicit: row.explicit,
			id: row.id,
			deletedAt: row.deletedAt,
			isPublic: row.isPublic,
			title: row.title,
			trackNumber: row.trackNumber,
			updatedAt: row.updatedAt,
			lyrics: row.lyrics,
			album: row.album,
			artists: row.artists ?? [],
			audioFileKey: row.audioFileKey,
			audioFileSize: row.audioFileSize,
			audioContentType: row.audioContentType,
			drmEnabled: row.drmEnabled,
		})
	}
}

export default TrackRepositoryPrismaORM
