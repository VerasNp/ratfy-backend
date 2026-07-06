import Artist from '#domain/artist/Artist.js'
import User from '#domain/user/User.js'
import { describe, expect, it } from 'vitest'

describe('Artist domain model', () => {
	const dummyUser = User.create(
		'Foo',
		'foo@example.com',
		'Valid@123',
		new Date('1990-01-01'),
	)
	it('should create an Artist instance with valid parameters', () => {
		const artist = Artist.create({
			bio: 'This is a valid bio.',
			user: dummyUser,
		})
		expect(artist).toBeInstanceOf(Artist)
		expect(artist.bio).toBe('This is a valid bio.')
		expect(artist.userId).toBe(dummyUser.id)
	})

	it('should restore an Artist instance from persistence', () => {
		const artist = Artist.restore({
			id: crypto.randomUUID(),
			bio: 'Restored bio',
			userId: dummyUser.id,
			user: dummyUser,
		})
		expect(artist).toBeInstanceOf(Artist)
		expect(artist.id).toBeDefined()
		expect(artist.bio).toBe('Restored bio')
		expect(artist.userId).toBe(dummyUser.id)
		expect(artist.user?.name).toBe(dummyUser.name)
	})

	it('should restore an Artist instance with null user', () => {
		const artist = Artist.restore({
			id: crypto.randomUUID(),
			bio: null,
			userId: dummyUser.id,
			user: null,
		})
		expect(artist).toBeInstanceOf(Artist)
		expect(artist.bio).toBeNull()
		expect(artist.user).toBeNull()
	})

	it("should update the artist data", () => {
		const artist = Artist.create({
			bio: 'Initial bio.',
			user: dummyUser,
		})
		artist.updateData({ bio: 'Updated bio.' })
		expect(artist.bio).toBe('Updated bio.')
	})
})
