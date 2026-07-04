import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

import { AlbumNotFoundError } from '#application/errors/AlbumNotFoundError.js'
import Album, { type AlbumType, type ReleasePrecision } from '#domain/album/Album.js'

import type { Album as PrismaAlbum, PrismaClient } from '../../../prisma/generated/prisma/client'

class AlbumRepositoryPrismaORM implements AlbumRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async create(album: Album): Promise<Album> {
		const row = await this.orm.album.create({
			data: {
				albumType: album.albumType,
				artistIds: album.artistIds,
				createdAt: album.createdAt,
				id: album.id,
				isDeleted: album.isDeleted,
				isPublic: album.isPublic,
				label: album.label,
				name: album.name,
				releaseDate: album.releaseDate.toString(),
				releasePrecision: album.releasePrecision,
				totalTracks: album.totalTracks,
			},
		})
		return this.toDomain(row)
	}
	
	async delete(id: string): Promise<void> {
		await this.orm.album.update({
			data: { isDeleted: true, isPublic: false },
			where: { id },
		})
	}
	async findById(id: string): Promise<Album | null> {
		const row = await this.orm.album.findUnique({ where: { id } })
		return row ? this.toDomain(row) : null
	}

	async listByIds(ids: string[]): Promise<Album[]> {
		const rows = await this.orm.album.findMany({
			where: { id: { in: ids }, isDeleted: false },
		})
		return rows.map((row) => this.toDomain(row))
	}

	async list(page: number, limit: number): Promise<Album[]> {
		const rows = await this.orm.album.findMany({
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
			where: { isDeleted: false },
		})
		return rows.map((row) => this.toDomain(row))
	}
	async update(id: string, data: Partial<Album>): Promise<void> {
		await this.orm.album.update({
			data: {
				...(data.name != null && { name: data.name }),
				...(data.albumType != null && { albumType: data.albumType }),
				...(data.releaseDate != null && { releaseDate: data.releaseDate }),
				...(data.releasePrecision != null && { releasePrecision: data.releasePrecision }),
				...(data.totalTracks != null && { totalTracks: data.totalTracks }),
				...(data.label != null && { label: data.label }),
				...(data.artistIds != null && { artistIds: data.artistIds }),
				...(data.isPublic != null && { isPublic: data.isPublic }),
			},
			where: { id },
		})
		return Promise.resolve()
	}
	private toDomain(row: PrismaAlbum): Album {
		return Album.restore({
			albumType: row.albumType as AlbumType,
			artistIds: row.artistIds,
			createdAt: row.createdAt,
			id: row.id,
			isDeleted: row.isDeleted,
			isPublic: row.isPublic,
			label: row.label,
			name: row.name,
			releaseDate: new Date(row.releaseDate),
			releasePrecision: row.releasePrecision as ReleasePrecision,
			totalTracks: row.totalTracks,
			updatedAt: row.updatedAt,
		})
	}
}

export default AlbumRepositoryPrismaORM
