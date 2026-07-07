import Password from '#domain/user/Password.js'
import { describe, expect, it } from 'vitest'

describe('Password value object', () => {
	it('should create a valid password instance', () => {
		const password = Password.create('Valid1$1')
		expect(password).toBeInstanceOf(Password)
	})

	it('should throw an error for invalid password format', () => {
		expect(() => Password.create('short')).toThrow(
			'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
		)
		expect(() => Password.create('nouppercase1$')).toThrow(
			'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
		)
		expect(() => Password.create('NOLOWERCASE1$')).toThrow(
			'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
		)
		expect(() => Password.create('NoSpecialChar1')).toThrow(
			'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
		)
	})
})
