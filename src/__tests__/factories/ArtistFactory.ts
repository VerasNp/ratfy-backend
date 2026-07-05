import Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import type { PrismaClient } from '#prisma/client'

export async function createDummyArtistPrismaORM(
	orm: PrismaClient,
	userId: string,
	data: any = {},
): Promise<Artist> {
	const row = await orm.artist.create({
		data: {
			id: data.id || crypto.randomUUID(),
			bio: data.bio !== undefined ? data.bio : 'Dummy Bio',
			userId: userId,
		},
		include: { user: true },
	})
	return Artist.restore({
		id: row.id,
		bio: row.bio,
		userId: row.userId,
	})
}

export function createDummyArtist(user: User, data: any = {}): Artist {
	return Artist.create({
		bio: data.bio !== undefined ? data.bio : 'Dummy Bio',
		user: user,
	})
}
