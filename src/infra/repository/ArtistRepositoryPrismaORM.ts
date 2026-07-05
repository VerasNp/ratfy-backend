import type { ArtistRepository } from '#application/ports/ArtistRepository.js'
import Artist from '#domain/artist/Artist.js'
import User from '#domain/user/User.js'
import type { PrismaClient } from '#prisma/client'

class ArtistRepositoryPrismaORM implements ArtistRepository {
	public constructor(private readonly orm: PrismaClient) {}

	public async search(page: number, limit: number, query?: string): Promise<Artist[]> {
		const rows = this.orm.artist.findMany({
			where: {
				...(query && { user: { name: { contains: query, mode: 'insensitive' } } }),
			},
			include: { user: true },
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
		})
		return rows.then((rows) => rows.map((row) => this._toDomain(row)))
	}

	public async create(artist: Artist): Promise<Artist> {
		const row = await this.orm.artist.create({
			data: {
				id: artist.id,
				userId: artist.userId,
				bio: artist.bio,
			},
			include: { user: true },
		})
		return this._toDomain(row)
	}

	public async delete(id: string): Promise<Artist> {
		const row = await this.orm.artist.delete({
			where: { id },
			include: { user: true },
		})
		return this._toDomain(row)
	}

	public async findById(id: string): Promise<Artist | null> {
		const row = await this.orm.artist.findUnique({ where: { id }, include: { user: true } })
		return row ? this._toDomain(row) : null
	}

	public async findByUserId(userId: string): Promise<Artist | null> {
		const row = await this.orm.artist.findUnique({ where: { userId }, include: { user: true } })
		return row ? this._toDomain(row) : null
	}

	public async list(page: number, limit: number): Promise<Artist[]> {
		const rows = await this.orm.artist.findMany({
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
		})
		return rows.map((row) => this._toDomain(row))
	}

	public async update(id: string, data: Partial<Artist>): Promise<Artist> {
		const row = await this.orm.artist.update({
			data: {
				...(data.bio !== undefined && { bio: data.bio }),
			},
			where: { id },
			include: { user: true },
		})
		return Promise.resolve(this._toDomain(row))
	}

	private _toDomain(row: any): Artist {
		return Artist.restore({
			id: row.id,
			bio: row.bio,
			userId: row.userId,
			user: row.user
				? User.restore(
						row.user.id,
						row.user.name,
						row.user.email,
						row.user.password,
						row.user.birthDate,
						row.user.verifiedAt,
					)
				: null,
		})
	}
}

export default ArtistRepositoryPrismaORM
