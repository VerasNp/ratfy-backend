import ReleaseDate from '#domain/album/ReleaseDate.js'
import { describe, expect, it } from 'vitest'

describe('ReleaseDate value object', () => {
	it('should create a ReleaseDate instance with valid parameters', () => {
		const releaseDate = new ReleaseDate('2023-01-01', 'day')
		expect(releaseDate.value).toBe('2023-01-01')
		expect(releaseDate.precision).toBe('day')
	})

	it("should throw a error if the releaseDate doesn't match the precision", () => {
		expect(() => new ReleaseDate('2023-01-01', 'month')).toThrow(
			'releaseDate "2023-01-01" does not match precision "month". Expected format: /^\\d{4}-\\d{2}$/',
		)
	})

	it('should throw a error if the releasePrecision is invalid', () => {
		expect(() => new ReleaseDate('2023-01-01', 'invalid')).toThrow('Invalid release precision')
	})
})
