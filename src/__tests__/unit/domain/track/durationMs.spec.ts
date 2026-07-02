import DurationMs from '#domain/track/DurationMs.js'
import { describe, expect, it } from 'vitest'

describe('DurationMs Value Object', () => {
	it('should create a correct object', () => {
		const durationMs = new DurationMs(1000)
		expect(durationMs.value).toBe(1000)
	})
	it('should throw error if is not an integer', () => {
		expect(() => new DurationMs(10.9)).toThrow('Duration must be a non-negative integer')
	})
	it('should throw error if is a negative number', () => {
		expect(() => new DurationMs(-10)).toThrow('Duration must be a non-negative integer')
	})
})
