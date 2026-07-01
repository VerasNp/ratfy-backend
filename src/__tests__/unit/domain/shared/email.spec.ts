import Email from '#domain/shared/Email.js'
import { describe, expect, it } from 'vitest'

describe('Email value object', () => {
	it('should create a valid email instance', () => {
		const email = new Email('john@example.com')
		expect(email.value).toBe('john@example.com')
	})

	it('should throw an error for invalid email format', () => {
		expect(() => new Email('invalid-email')).toThrow('Invalid email format')
		expect(() => new Email('john@example')).toThrow('Invalid email format')
		expect(() => new Email('@example.com')).toThrow('Invalid email format')
	})
})
