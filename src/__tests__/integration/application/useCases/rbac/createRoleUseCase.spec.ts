import { createDummyRole } from '#__tests__/factories/RbacFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import CreateRoleUseCase from '#application/useCases/rbac/CreateRoleUseCase.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let createRoleUseCase: CreateRoleUseCase
let roleRepository: RoleRepository

describe('CreateRoleUseCase', () => {
	beforeEach(() => {
		roleRepository = new RoleRepositoryMemory()
		createRoleUseCase = new CreateRoleUseCase(roleRepository, loggerPortMock)
	})

	it('should create a new role', async () => {
		const result = await createRoleUseCase.execute({ name: 'EDITOR', description: 'Can edit' })
		expect(result.id).toBeDefined()
		expect(result.name).toBe('EDITOR')
		expect(result.description).toBe('Can edit')
	})

	it('should throw if role with the same name already exists', async () => {
		await roleRepository.createRole(createDummyRole({ name: 'EDITOR' }))
		await expect(
			createRoleUseCase.execute({ name: 'EDITOR' }),
		).rejects.toThrow('Role with name EDITOR already exists')
	})
})
