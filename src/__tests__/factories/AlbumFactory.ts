import Album from '#domain/album/Album.js'
import type { PrismaClient, Album as PrismaAlbum } from '#prisma/client'

export async function createDummyAlbumPrismaORM(
	orm: PrismaClient,
	artistId: string,
	data: Partial<PrismaAlbum> = {},
): Promise<PrismaAlbum> {
	return orm.album.create({
		data: {
			id: data.id || crypto.randomUUID(),
			name: data.name || 'Dummy Album',
			albumType: data.albumType || 'album',
			releaseDate: data.releaseDate || '2024-01-15',
			releasePrecision: data.releasePrecision || 'day',
			totalTracks: data.totalTracks || 30,
			label: data.label || 'Dummy Label',
			artistIds: [artistId],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
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
