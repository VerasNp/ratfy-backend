import Track from '#domain/track/Track.js'

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
	})
}
