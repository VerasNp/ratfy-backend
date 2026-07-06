import { createDummyRole } from '#__tests__/factories/RbacFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import RemoveRoleFromUserUseCase from '#application/useCases/rbac/RemoveRoleFromUserUseCase.js'
import type Role from '#domain/rbac/role/Role.js'
import type User from '#domain/user/User.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let removeRoleFromUserUseCase: RemoveRoleFromUserUseCase
let userRepository: UserRepository
let roleRepository: RoleRepository
let dummyUser: User
let dummyRole: Role

describe('RemoveRoleFromUserUseCase', () => {
	beforeEach(() => {
		userRepository = new UserRepositoryMemory()
		roleRepository = new RoleRepositoryMemory()
		dummyUser = createDummyUser()
		dummyRole = createDummyRole({ name: 'EDITOR' })
		dummyUser.assignRole(dummyRole)
		userRepository.create(dummyUser)
		roleRepository.createRole(dummyRole)
		removeRoleFromUserUseCase = new RemoveRoleFromUserUseCase(
			userRepository,
			roleRepository,
			loggerPortMock,
		)
	})

	it('should remove a role from a user', async () => {
		const result = await removeRoleFromUserUseCase.execute(dummyUser.id, dummyRole.id)
		expect(result.userId).toBe(dummyUser.id)
		expect(result.roles).toHaveLength(0)
	})

	it('should throw if user does not exist', async () => {
		await expect(
			removeRoleFromUserUseCase.execute('non-existent-user', dummyRole.id),
		).rejects.toThrow('User not found')
	})

	it('should throw if role does not exist', async () => {
		await expect(
			removeRoleFromUserUseCase.execute(dummyUser.id, 'non-existent-role'),
		).rejects.toThrow('Role not found')
	})
})
