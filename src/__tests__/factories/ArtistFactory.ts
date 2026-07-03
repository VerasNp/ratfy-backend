import Artist from '#domain/artist/Artist.js'
import type User from '#domain/user/User.js'
import type { Artist as PrismaArtist, PrismaClient } from '#prisma/client'

export async function createDummyArtistPrismaORM(
	orm: PrismaClient,
	userId: string,
	data: Partial<PrismaArtist> = {},
): Promise<PrismaArtist> {
	return orm.artist.create({
		data: {
			id: data.id || crypto.randomUUID(),
			bio: data.bio || 'Dummy Bio',
			userId: userId,
			createdAt: data.createdAt || new Date(),
			updatedAt: data.updatedAt || new Date(),
		},
	})
}

export function createDummyArtist(user: User, data: any = {}): Artist {
	return Artist.create({
		bio: data.bio || 'Dummy Bio',
		user: user,
	})
}
