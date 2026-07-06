import { createDummyRole } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import DeleteRoleUseCase from '#application/useCases/rbac/DeleteRoleUseCase.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let deleteRoleUseCase: DeleteRoleUseCase
let roleRepository: RoleRepository

describe('DeleteRoleUseCase', () => {
	beforeEach(() => {
		roleRepository = new RoleRepositoryMemory()
		deleteRoleUseCase = new DeleteRoleUseCase(roleRepository, loggerPortMock)
	})

	it('should delete an existing role', async () => {
		const dummyRole = createDummyRole({ name: 'DELETE_ME' })
		await roleRepository.createRole(dummyRole)
		const result = await deleteRoleUseCase.execute(dummyRole.id)
		expect(result.name).toBe('DELETE_ME')
		const found = await roleRepository.findRoleById(dummyRole.id)
		expect(found).toBeNull()
	})

	it('should throw if role does not exist', async () => {
		await expect(deleteRoleUseCase.execute('non-existent')).rejects.toThrow('Role not found')
	})
})
