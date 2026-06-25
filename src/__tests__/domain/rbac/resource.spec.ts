import Resource from '#domain/rbac/resource/Resource.js'
import { describe, expect, it } from 'vitest'

describe('Resource', () => {
	it('should create a resource', () => {
		const resource = Resource.create('TEST')
		expect(resource.id).toBeDefined()
		expect(resource.name).toBe('TEST')
	})

	it('should restore a resource', () => {
		const resource = Resource.restore('123', 'TEST')
		expect(resource.id).toBe('123')
		expect(resource.name).toBe('TEST')
	})

	it('should update resource data', () => {
		const resource = Resource.create('TEST')
		resource.updateData({ name: 'UPDATED' })
		expect(resource.name).toBe('UPDATED')
	})

	it('should throw an error when updating resource with empty name', () => {
		const resource = Resource.create('TEST')
		expect(() => resource.updateData({ name: '' })).toThrow('Resource name cannot be empty')
	})
})
