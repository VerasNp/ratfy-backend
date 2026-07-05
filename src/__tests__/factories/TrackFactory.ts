import Track from '#domain/track/Track.js'
import type { PrismaClient } from '#prisma/client'

export function createDummyTrack(data: Partial<Track> = {}): Track {
	return Track.create({
		title: data.title || 'Dummy Track',
		durationMs: data.durationMs || 180000,
		discNumber: data.discNumber || 1,
		trackNumber: data.trackNumber || 1,
		explicit: data.explicit || false,
		lyrics: data.lyrics || null,
		isPublic: data.isPublic || true,
		album: data.album || ({} as any),
		artists: data.artists || [],
	})
}

export async function createDummyTrackPrismaORM(
	orm: PrismaClient,
	data: Partial<Track> = {},
): Promise<Track> {
	const row = await orm.track.create({
		data: {
			title: data.title || 'Dummy Track',
			durationMs: data.durationMs || 180000,
			discNumber: data.discNumber || 1,
			trackNumber: data.trackNumber || 1,
			explicit: data.explicit || false,
			lyrics: data.lyrics || null,
			isPublic: data.isPublic || true,
			album: {
				connect: {
					id: data.album?.id || '',
				},
			},
			artists: {
				connect: data.artists?.map((a) => ({ id: a.id })) || [],
			},
		},
	})
	return Track.restore(row)
}
