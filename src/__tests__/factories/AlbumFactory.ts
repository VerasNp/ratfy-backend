import Album from '#domain/album/Album.js'
import type { PrismaClient } from '#prisma/client'

export async function createDummyAlbumPrismaORM(
	orm: PrismaClient,
	data: any = {},
): Promise<Album> {
	const row = await orm.album.create({
		data: {
			id: data.id || crypto.randomUUID(),
			name: data.name || 'Dummy Album',
			albumType: data.albumType || 'album',
			releaseDate: data.releaseDate || '2024-01-15',
			releasePrecision: data.releasePrecision || 'day',
			totalTracks: data.totalTracks || 30,
			label: data.label || 'Dummy Label',
			artists: {
				createMany: {
					data: (data.artists || []).map((artist: any) => ({
						artistId: artist.id,
					})),
				},
			},
			isPublic: data.isPublic || true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		include: { artists: true },
	})
	return Album.restore({
		id: row.id,
		name: row.name,
		albumType: row.albumType,
		releaseDate: row.releaseDate,
		releasePrecision: row.releasePrecision,
		totalTracks: row.totalTracks,
		label: row.label,
		artistCredits: row.artists.map((artist: any) => ({
			artistId: artist.artistId,
			albumId: row.id,
		})),
		isPublic: row.isPublic,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	})
}

export function createDummyAlbum(data: any = {}): Album {
	return Album.create({
		name: data.name || 'Dummy Album',
		albumType: data.albumType || 'album',
		releaseDate: data.releaseDate || '2024-01-15',
		releasePrecision: data.releasePrecision || 'day',
		totalTracks: data.totalTracks || 30,
		label: data.label || 'Dummy Label',
		artists: data.artists || [],
		isPublic: data.isPublic || true,
	})
}
