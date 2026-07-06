import { createDummyRole } from '#__tests__/factories/RoleFactory.js'
import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import GetUserUseCase from '#application/useCases/user/GetUserUseCase.js'
import type Role from '#domain/rbac/role/Role.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let getUserUseCase: GetUserUseCase
let userRepository: UserRepository

describe('GetUserUseCase', () => {
	let dummyUser: User
	let dummyRole: Role
	beforeEach(() => {
		dummyRole = createDummyRole()
		dummyUser = createDummyUser({
			roles: [dummyRole],
		})
		userRepository = new UserRepositoryMemory([dummyUser])
		getUserUseCase = new GetUserUseCase(userRepository, loggerPortMock)
	})
	it('should return user data with roles', async () => {
		const output = await getUserUseCase.execute(dummyUser.id)
		expect(output).toEqual({
			id: dummyUser.id,
			name: dummyUser.name,
			email: dummyUser.email,
			birthDate: dummyUser.birthDate,
			roles: [
				{
					id: dummyRole.id,
					name: dummyRole.name.value,
				},
			],
		})
	})
	it('should throw an error if user is not found', async () => {
		const nonExistentUserId = 'non-existent-user-id'
		await expect(getUserUseCase.execute(nonExistentUserId)).rejects.toThrowError(
			'User not found',
		)
	})
})
