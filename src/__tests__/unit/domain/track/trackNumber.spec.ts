import TrackNumber from '#domain/track/TrackNumber.js'
import { describe, expect, it } from 'vitest'

describe('TrackNumber Value Object', () => {
	it('should create a correct object', () => {
		const trackNumber = new TrackNumber(1)
		expect(trackNumber.value).toBe(1)
	})

	it('should throw error if is not an integer', () => {
		expect(() => new TrackNumber(10.9)).toThrow('Track number must be a non-negative integer')
	})

	it('should throw error if is a negative number', () => {
		expect(() => new TrackNumber(-10)).toThrow('Track number must be a non-negative integer')
	})

	it('should throw error if is less than 1', () => {
		expect(() => new TrackNumber(0)).toThrow('Track number must be at least 1')
	})
})
