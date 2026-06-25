import Role from '#domain/rbac/role/Role.js'
import { describe, expect, it } from 'vitest'

describe('Role', () => {
	it('should create a role', () => {
		const role = Role.create('TEST', null)
		expect(role.id).toBeDefined()
		expect(role.name).toBe('TEST')
		expect(role.description).toBeNull()
	})

	it('should restore a role', () => {
		const role = Role.restore('123', 'TEST', 'DESCRIPTION')
		expect(role.id).toBe('123')
		expect(role.name).toBe('TEST')
		expect(role.description).toBe('DESCRIPTION')
	})

	it('should update role data', () => {
		const role = Role.create('TEST', null)
		role.updateData({ name: 'UPDATED', description: 'UPDATED_DESCRIPTION' })
		expect(role.name).toBe('UPDATED')
		expect(role.description).toBe('UPDATED_DESCRIPTION')
	})

	it('should throw an error when updating role with empty name', () => {
		const role = Role.create('TEST', null)
		expect(() => role.updateData({ name: '' })).toThrow('Role name cannot be empty')
	})
})
