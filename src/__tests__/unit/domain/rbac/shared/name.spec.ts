import Name from '#domain/rbac/shared/Name.js'
import { describe, expect, it } from 'vitest'

describe('Name Value Object', () => {
	it('should create a Name instance', () => {
		const name = new Name('Valid Name')
		expect(name.value).toBe('VALID_NAME')
	})

	it('should throw an error for empty name', () => {
		expect(() => new Name('')).toThrow('Name cannot be empty')
	})

	it('should throw an error for name with invalid characters', () => {
		expect(() => new Name('Invalid Name!')).toThrow('Name must be alphanumeric')
	})
})
