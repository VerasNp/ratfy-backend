import { createDummyRole } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import UpdateRoleUseCase from '#application/useCases/rbac/UpdateRoleUseCase.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let updateRoleUseCase: UpdateRoleUseCase
let roleRepository: RoleRepository

describe('UpdateRoleUseCase', () => {
	beforeEach(() => {
		roleRepository = new RoleRepositoryMemory()
		updateRoleUseCase = new UpdateRoleUseCase(roleRepository, loggerPortMock)
	})

	it('should update an existing role', async () => {
		const dummyRole = createDummyRole({ name: 'OLD', description: 'Old' })
		await roleRepository.createRole(dummyRole)
		const result = await updateRoleUseCase.execute(dummyRole.id, {
			name: 'UPDATED',
			description: 'Updated',
		})
		expect(result.name).toBe('UPDATED')
		expect(result.description).toBe('Updated')
	})

	it('should throw if role does not exist', async () => {
		await expect(
			updateRoleUseCase.execute('non-existent', { name: 'NOPE', description: null }),
		).rejects.toThrow('Role not found')
	})

	it('should throw if new name is already taken by another role', async () => {
		const role1 = createDummyRole({ name: 'ROLE1' })
		const role2 = createDummyRole({ name: 'ROLE2' })
		await roleRepository.createRole(role1)
		await roleRepository.createRole(role2)
		await expect(
			updateRoleUseCase.execute(role1.id, { name: 'ROLE2', description: null }),
		).rejects.toThrow('Role with the same name already exists')
	})
})
