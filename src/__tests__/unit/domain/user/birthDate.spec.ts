import BirthDate from '#domain/user/BirthDate.js'
import { describe, expect, it } from 'vitest'

describe('BirthDate value object', () => {
	it('should create a valid birth date instance', () => {
		const birthDate = new BirthDate(new Date(2000, 0, 1))
		expect(birthDate).toBeInstanceOf(BirthDate)
	})

	it('should throw an error for future birth date', () => {
		expect(() => new BirthDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))).toThrow(
			'Birth date must be a valid date in the past',
		)
	})

	it('should throw an error for birth date less than 18 years ago', () => {
		const now = new Date()
		const recentBirthDate = new Date(now.getFullYear() - 17, now.getMonth(), now.getDate())
		expect(() => new BirthDate(recentBirthDate)).toThrow(
			'Must be at least 18 years old',
		)
	})
})
