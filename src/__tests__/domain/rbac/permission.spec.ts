import Permission from '#domain/rbac/permission/Permission.js'
import { describe, expect, it } from 'vitest'

describe('Permission', () => {
	it('should create a permission', () => {
		const permission = Permission.create('TEST', null)
		expect(permission.id).toBeDefined()
		expect(permission.name).toBe('TEST')
		expect(permission.description).toBeNull()
	})

	it('should restore a permission', () => {
		const permission = Permission.restore('123', 'TEST', 'DESCRIPTION')
		expect(permission.id).toBe('123')
		expect(permission.name).toBe('TEST')
		expect(permission.description).toBe('DESCRIPTION')
	})

	it('should update permission data', () => {
		const permission = Permission.create('TEST', null)
		permission.updateData({ name: 'UPDATED', description: 'UPDATED_DESCRIPTION' })
		expect(permission.name).toBe('UPDATED')
		expect(permission.description).toBe('UPDATED_DESCRIPTION')
	})

	it('should throw an error when updating permission with empty name', () => {
		const permission = Permission.create('TEST', null)
		expect(() => permission.updateData({ name: '' })).toThrow('Permission name cannot be empty')
	})
})
