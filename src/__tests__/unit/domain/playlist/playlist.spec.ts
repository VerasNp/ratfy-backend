import Playlist from '#domain/playlist/Playlist.js'
import { describe, expect, it } from 'vitest'

describe('Playlist domain model', () => {
	it('should create a Playlist instance with valid parameters', () => {
		const playlist = Playlist.create({
			name: 'My Playlist',
			ownerId: crypto.randomUUID(),
		})
		expect(playlist).toBeInstanceOf(Playlist)
		expect(playlist.name).toBe('My Playlist')
		expect(playlist.isPublic).toBe(true)
		expect(playlist.ownerId).toBeDefined()
		expect(playlist.createdAt).toBeInstanceOf(Date)
		expect(playlist.updatedAt).toBeInstanceOf(Date)
	})

	it('should create a private playlist', () => {
		const playlist = Playlist.create({
			name: 'Private',
			ownerId: crypto.randomUUID(),
			isPublic: false,
		})
		expect(playlist.isPublic).toBe(false)
	})

	it('should throw an error if the name is empty', () => {
		expect(() =>
			Playlist.create({ name: '', ownerId: crypto.randomUUID() }),
		).toThrow('Playlist name cannot be empty.')
	})

	it('should throw an error if the name exceeds 100 characters', () => {
		expect(() =>
			Playlist.create({ name: 'a'.repeat(101), ownerId: crypto.randomUUID() }),
		).toThrow('Playlist name exceeds the maximum allowed length of 100 characters.')
	})

	it('should restore a Playlist instance from persistence', () => {
		const id = crypto.randomUUID()
		const ownerId = crypto.randomUUID()
		const now = new Date()
		const playlist = Playlist.restore({
			id,
			name: 'Restored',
			isPublic: false,
			ownerId,
			createdAt: now,
			updatedAt: now,
		})
		expect(playlist).toBeInstanceOf(Playlist)
		expect(playlist.id).toBe(id)
		expect(playlist.name).toBe('Restored')
		expect(playlist.isPublic).toBe(false)
		expect(playlist.ownerId).toBe(ownerId)
		expect(playlist.createdAt).toBe(now)
		expect(playlist.updatedAt).toBe(now)
	})
})
