import { createDummyRole } from '#__tests__/factories/RbacFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import AssignRoleToUserUseCase from '#application/useCases/rbac/AssignRoleToUserUseCase.js'
import type Role from '#domain/rbac/role/Role.js'
import type User from '#domain/user/User.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let assignRoleToUserUseCase: AssignRoleToUserUseCase
let userRepository: UserRepository
let roleRepository: RoleRepository
let dummyUser: User
let dummyRole: Role

describe('AssignRoleToUserUseCase', () => {
	beforeEach(() => {
		userRepository = new UserRepositoryMemory()
		roleRepository = new RoleRepositoryMemory()
		dummyUser = createDummyUser()
		dummyRole = createDummyRole({ name: 'EDITOR' })
		userRepository.create(dummyUser)
		roleRepository.createRole(dummyRole)
		assignRoleToUserUseCase = new AssignRoleToUserUseCase(
			userRepository,
			roleRepository,
			loggerPortMock,
		)
	})

	it('should assign a role to a user', async () => {
		const result = await assignRoleToUserUseCase.execute(dummyUser.id, dummyRole.id)
		expect(result).toEqual({})
		const updatedUser = await userRepository.findById(dummyUser.id)
		expect(updatedUser!.roles).toHaveLength(1)
		expect(updatedUser!.roles[0]!.id).toBe(dummyRole.id)
	})

	it('should throw if user does not exist', async () => {
		await expect(
			assignRoleToUserUseCase.execute('non-existent-user', dummyRole.id),
		).rejects.toThrow('User not found')
	})

	it('should throw if role does not exist', async () => {
		await expect(
			assignRoleToUserUseCase.execute(dummyUser.id, 'non-existent-role'),
		).rejects.toThrow('Role not found')
	})
})
