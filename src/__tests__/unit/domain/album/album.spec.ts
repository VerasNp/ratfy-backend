import { createDummyArtist } from '#__tests__/factories/ArtistFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import Album from '#domain/album/Album.js'
import { describe, expect, it } from 'vitest'

describe('Album domain model', () => {
	it('should create an Album instance', () => {
		const dummyUser = createDummyUser()
		const dummyArtist = createDummyArtist(dummyUser)
		const album = Album.create({
			name: 'Test Album',
			albumType: 'album',
			releaseDate: '2023-01-01',
			releasePrecision: 'day',
			totalTracks: 10,
			label: 'Test Label',
			isPublic: true,
			artists: [dummyArtist],
		})
		expect(album.name).toBe('Test Album')
		expect(album.albumType).toBe('album')
		expect(album.releaseDate).toBe('2023-01-01')
		expect(album.releasePrecision).toBe('day')
		expect(album.totalTracks).toBe(10)
		expect(album.label).toBe('Test Label')
		expect(album.isPublic).toBe(true)
		expect(album.artistCredits).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					artistId: dummyArtist.id,
				}),
			]),
		)
	})
})
