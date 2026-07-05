import { isNonNegativeInteger } from '#domain/shared/utils/isNonNegativeInteger.js'
import { describe, expect, it } from 'vitest'

describe('isNonNegativeInteger', () => {
	it('should return true for non-negative integers', () => {
		expect(isNonNegativeInteger(0)).toBe(true)
		expect(isNonNegativeInteger(1)).toBe(true)
		expect(isNonNegativeInteger(100)).toBe(true)
	})

	it('should return false for negative integers', () => {
		expect(isNonNegativeInteger(-1)).toBe(false)
		expect(isNonNegativeInteger(-100)).toBe(false)
	})

	it('should return false for non-integer numbers', () => {
		expect(isNonNegativeInteger(1.5)).toBe(false)
		expect(isNonNegativeInteger(-1.5)).toBe(false)
	})

	it('should return false for non-number types', () => {
		expect(isNonNegativeInteger('string')).toBe(false)
		expect(isNonNegativeInteger(null)).toBe(false)
		expect(isNonNegativeInteger(undefined)).toBe(false)
	})
})
