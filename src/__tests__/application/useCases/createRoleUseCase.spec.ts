import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import CreateRoleUseCase from '#application/useCases/rbac/CreateRoleUseCase.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import { beforeAll, describe, expect, it } from 'vitest'

let createRoleUseCase: CreateRoleUseCase
let roleRepository: RoleRepository

beforeAll(() => {
	roleRepository = new RoleRepositoryMemory()
	createRoleUseCase = new CreateRoleUseCase(roleRepository, loggerPortMock)
})

describe('CreateRoleUseCase', () => {
	it('should create a role successfully', async () => {
		const input = {
			name: 'Admin',
			description: 'Administrator role',
		}
		const output = await createRoleUseCase.execute(input)
		expect(output.id).toBeDefined()
		expect(output.name).toBe(input.name.toUpperCase())
		expect(output.description).toBe(input.description)
	})

	it('should throw an error if role already exists', async () => {
		const input = {
			name: 'Teste',
			description: 'Administrator role',
		}
		await createRoleUseCase.execute(input)
		await expect(createRoleUseCase.execute(input)).rejects.toThrow(
			`Role with name ${input.name.toUpperCase()} already exists`,
		)
	})
})
