import AlbumType from '#domain/album/AlbumType.js'
import { describe, expect, it } from 'vitest'

describe('AlbumType value object', () => {
	it('should create a AlbumType instance', () => {
		const albumType = new AlbumType('album')
		expect(albumType.value).toBe('album')
	})

	it('should throw an error if the AlbumType value is invalid', () => {
		expect(() => new AlbumType('invalid')).toThrow('Invalid AlbumType value: invalid')
	})
})
