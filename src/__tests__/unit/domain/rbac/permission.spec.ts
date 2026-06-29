import Operation from '#domain/rbac/operation/Operation.js'
import Permission from '#domain/rbac/permission/Permission.js'
import Resource from '#domain/rbac/resource/Resource.js'
import { describe, expect, it } from 'vitest'

describe('Permission', () => {
	it('should create a permission', () => {
		const permission = Permission.create(
			Operation.create('TEST_OPERATION'),
			Resource.create('TEST_RESOURCE'),
		)
		expect(permission.id).toBeDefined()
		expect(permission.operation.name.value).toBe('TEST_OPERATION')
		expect(permission.resource.name.value).toBe('TEST_RESOURCE')
		expect(permission.label).toBe('TEST_OPERATION:TEST_RESOURCE')
	})

	it('should restore a permission', () => {
		const operation = Operation.create('TEST_OPERATION')
		const resource = Resource.create('TEST_RESOURCE')
		const permission = Permission.restore(
			'1234',
			operation,
			resource,
		)
		expect(permission.id).toBe('1234')
		expect(permission.operation.name.value).toBe('TEST_OPERATION')
		expect(permission.resource.name.value).toBe('TEST_RESOURCE')
		expect(permission.label).toBe('TEST_OPERATION:TEST_RESOURCE')
	})
})
