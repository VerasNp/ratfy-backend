import Playlist from '#domain/playlist/Playlist.js'
import type User from '#domain/user/User.js'
import type { PrismaClient } from '#prisma/client'

export async function createDummyPlaylistPrismaORM(
	orm: PrismaClient,
	ownerId: string,
	data: any = {},
): Promise<Playlist> {
	const row = await orm.playlist.create({
		data: {
			id: data.id || crypto.randomUUID(),
			name: data.name || 'Dummy Playlist',
			isPublic: data.isPublic ?? true,
			ownerId: ownerId,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	})
	return Playlist.restore({
		id: row.id,
		name: row.name,
		isPublic: row.isPublic,
		ownerId: row.ownerId,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	})
}

export function createDummyPlaylist(owner: User, data: any = {}): Playlist {
	return Playlist.create({
		name: data.name || 'Dummy Playlist',
		ownerId: owner.id,
		isPublic: data.isPublic ?? true,
	})
}
