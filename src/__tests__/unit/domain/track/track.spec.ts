import Track from '#domain/track/Track.js'
import { describe, expect, it } from 'vitest'

describe('Track Value Object', () => {
	it('should create a correct object', () => {
		const track = Track.create({
			title: 'Track Title',
			durationMs: 300000,
			discNumber: 1,
			trackNumber: 1,
			explicit: false,
			isPublic: true,
			album: null as any,
		})
		expect(track.id).toBeDefined()
		expect(track.title).toBe('Track Title')
		expect(track.durationMs.value).toBe(300000)
		expect(track.discNumber.value).toBe(1)
		expect(track.trackNumber.value).toBe(1)
		expect(track.explicit).toBe(false)
		expect(track.isPublic).toBe(true)
		expect(track.lyrics).toBeNull()
		expect(track.artists).toEqual([])
		expect(track.createdAt).toBeInstanceOf(Date)
		expect(track.updatedAt).toBeInstanceOf(Date)
		expect(track.deletedAt).toBeNull()
	})
})
