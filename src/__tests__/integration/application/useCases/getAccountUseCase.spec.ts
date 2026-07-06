import { createDummyUser } from '#__tests__/factories/UserFactory.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import GetAccountUseCase from '#application/useCases/user/GetAccountUseCase.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let getAccountUseCase: GetAccountUseCase
let userRepository: UserRepository

describe('GetAccountUseCase', () => {
	let dummyUser: User
	beforeEach(() => {
		dummyUser = createDummyUser()
		userRepository = new UserRepositoryMemory([dummyUser])
		getAccountUseCase = new GetAccountUseCase(userRepository, loggerPortMock)
	})
	it('should get account details successfully', async () => {
		const outputGetAccount = await getAccountUseCase.execute(dummyUser.id)
		expect(outputGetAccount.id).toBe(dummyUser.id)
		expect(outputGetAccount.name).toBe(dummyUser.name)
		expect(outputGetAccount.email).toBe(dummyUser.email)
		expect(outputGetAccount.birthDate).toEqual(dummyUser.birthDate)
	})
	it('should throw an error if user not found', async () => {
		await expect(getAccountUseCase.execute('non-existing-id')).rejects.toThrow('User not found')
	})
})
