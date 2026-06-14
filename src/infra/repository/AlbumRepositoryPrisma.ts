import type { AlbumRepository } from '#application/ports/AlbumRepository.js'

import Album, { type AlbumType } from '#domain/album/Album.js'
import { AlbumNotFoundError } from '#domain/erros/AlbumNotFoundError.js'

import type { PrismaClient } from '../../../prisma/generated/prisma/client'


class AlbumRepositoryPrismaORM implements AlbumRepository {
	private orm: PrismaClient
	constructor(orm: PrismaClient) {
		this.orm = orm;
	}
	async create(album: Album): Promise<Album> {
		await this.orm.album.create({
			data: {
				albumType:			album.albumType,
				artistIds:			album.artistIds,
				createdAt:			album.createdAt ,
				id: 				album.id,
				isDeleted:			album.isDeleted ,
				isPublic:			album.isPublic ,
				label:				album.label ,
				name:				album.name ,
				releaseDate:		album.releaseDate , // yyyy-mm-dd <- Sort
				totalTracks: 		album.totalTracks,
			},
		})
		return new Album(
			album.id,
			album.name,
			album.albumType,
			album.releaseDate,
			album.totalTracks,
			album.label,
			album.artistIds,
			album.createdAt,
			album.isDeleted,
			album.isPublic,
		);
	}
	async delete(id: string): Promise<void> {
		const auxAlbum = await this.findById(id)
		if (!auxAlbum) throw new AlbumNotFoundError(id)
		await this.orm.album.update(
			{
				data: { isDeleted: true , isPublic: false },
				where: { id },
			},

		)

	}
	async findById(id: string): Promise<Album|null> {
		const album = await this.orm.album.findUnique(
			{
				where: {
					id:id,
				}
			},
		)
		if (album == null)
			return null
		else
			return (
				Album.restore(
					album.id,
					album.name,
					album.albumType,
					album.releaseDate,
					album.totalTracks,
					album.label,
					album.artistIds,
					album.createdAt,
					album.isDeleted,
					album.isPublic,
				)
			)
	}
	async update(id: string, data: Partial<Album>): Promise<void> {
		const auxAlbum = await this.findById(id)
  		if (!auxAlbum) throw new AlbumNotFoundError(id)

		await this.orm.album.update({
			data,
			where: { id },
		})
	}
}
export default AlbumRepositoryPrismaORM;
