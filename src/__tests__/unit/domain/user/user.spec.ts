import { describe, expect, it } from 'vitest'
import User from '#domain/user/User.js'

describe('User domain', () => {
	it('should create a new user instance', () => {
		const user = User.create(
			'John Doe',
			'john@example.com',
			'Valid$123',
			new Date('1990-01-01'),
		)
		expect(user.name).toBe('John Doe')
		expect(user.email).toBe('john@example.com')
		expect(user.password).toBe('Valid$123')
		expect(user.birthDate).toBeInstanceOf(Date)
	})
})
