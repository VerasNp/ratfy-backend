import Operation from '#domain/rbac/operation/Operation.js'
import { describe, expect, it } from 'vitest'

describe('Operation', () => {
	it('should create an operation', () => {
		const operation = Operation.create('TEST_OPERATION')
		expect(operation.id).toBeDefined()
		expect(operation.name.value).toBe('TEST_OPERATION')
	})

	it('should restore an operation', () => {
		const operation = Operation.restore('123', 'TEST_OPERATION')
		expect(operation.id).toBe('123')
		expect(operation.name.value).toBe('TEST_OPERATION')
	})

	it('should update operation data', () => {
		const operation = Operation.create('TEST_OPERATION')
		operation.updateData({ name: 'UPDATED_OPERATION' })
		expect(operation.name.value).toBe('UPDATED_OPERATION')
	})
})
