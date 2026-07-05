import type { AlbumRepository } from '#application/ports/AlbumRepository.js'
import { Prisma, type Album as PrismaAlbum, type PrismaClient } from '#prisma/client'
import Album from '#domain/album/Album.js'
import type { TransactionHandle } from '#application/ports/TransactionHandle.js'

class AlbumRepositoryPrismaORM implements AlbumRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async create(album: Album): Promise<Album> {
		const row = await this.orm.album.create({
			data: {
				albumType: album.albumType,
				createdAt: album.createdAt,
				id: album.id,
				isPublic: album.isPublic,
				label: album.label,
				name: album.name,
				releaseDate: album.releaseDate.toString(),
				releasePrecision: album.releasePrecision,
				totalTracks: album.totalTracks,
				updatedAt: album.updatedAt,
				deletedAt: album.deletedAt,
				artists: {
					createMany: {
						data: album.artistCredits.map((artistCredit) => ({
							artistId: artistCredit.artistId,
						})),
					},
				},
			},
			include: { artists: true },
		})
		return this._toDomain(row)
	}

	public async delete(albumId: string, tx?: TransactionHandle): Promise<void> {
		const client = tx ? (tx as unknown as Prisma.TransactionClient) : this.orm
		try {
			await client.album.delete({ where: { id: albumId } })
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return
			}
			throw error
		}
	}

	public async findById(id: string): Promise<Album | null> {
		const row = await this.orm.album.findUnique({ where: { id }, include: { artists: true } })
		return row ? this._toDomain(row) : null
	}

	public async listByIds(ids: string[]): Promise<Album[]> {
		const rows = await this.orm.album.findMany({
			where: { id: { in: ids }, deletedAt: { equals: null } },
			include: { artists: true },
		})
		return rows.map((row) => this._toDomain(row))
	}

	public async list(page: number, limit: number): Promise<Album[]> {
		const rows = await this.orm.album.findMany({
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
			where: { deletedAt: { equals: null } },
			include: { artists: true },
		})
		return rows.map((row) => this._toDomain(row))
	}

	public async update(albumId: string, data: Partial<Album>): Promise<Album | null> {
		try {
			const row = await this.orm.album.update({
				data: {
					...(data.name != null && { name: data.name }),
					...(data.albumType != null && { albumType: data.albumType }),
					...(data.releaseDate != null && { releaseDate: data.releaseDate }),
					...(data.releasePrecision != null && {
						releasePrecision: data.releasePrecision,
					}),
					...(data.totalTracks != null && { totalTracks: data.totalTracks }),
					...(data.label != null && { label: data.label }),
					...(data.isPublic != null && { isPublic: data.isPublic }),
					...(data.artistCredits != null && {
						artists: {
							deleteMany: {},
							createMany: {
								data: data.artistCredits.map((artistCredit) => ({
									artistId: artistCredit.artistId,
								})),
							},
						},
					}),
				},
				where: { id: albumId },
				include: { artists: true },
			})
			return this._toDomain(row)
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				return null
			}
			throw error
		}
	}

	private _toDomain(row: any): Album {
		return Album.restore({
			albumType: row.albumType,
			artistCredits: row.artists.map((artist: any) => ({
				artistId: artist.artistId,
				albumId: row.id,
			})),
			createdAt: row.createdAt,
			id: row.id,
			isPublic: row.isPublic,
			label: row.label,
			name: row.name,
			releaseDate: row.releaseDate,
			releasePrecision: row.releasePrecision,
			totalTracks: row.totalTracks,
			updatedAt: row.updatedAt,
			deletedAt: row.deletedAt,
		})
	}
}

export default AlbumRepositoryPrismaORM
