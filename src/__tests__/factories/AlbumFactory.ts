import type { AlbumType } from '#domain/album/Album.js'
import Album from '#domain/album/Album.js'
import type { PrismaClient } from '#prisma/client'

export async function createDummyAlbum(orm: PrismaClient, artistId: string) {
	const record = orm.album.create({
		data: {
			id: crypto.randomUUID(),
			name: 'Dummy Album',
			albumType: 'album' as AlbumType,
			releaseDate: '2024-01-15',
			releasePrecision: 'day',
			totalTracks: 30,
			label: 'Dummy Label',
			artistIds: [artistId],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	})
}
