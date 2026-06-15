import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import GetAccountUseCase from '#application/useCases/GetAccountUseCase.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeAll, describe, expect, it, vi } from 'vitest'

let getAccount: GetAccountUseCase
let dummyUser: User

beforeAll(async () => {
	const userRepository = new UserRepositoryMemory()
	dummyUser = User.create('Existing User', 'foo@bar.com', 'Valid@123', new Date('1990-01-01'))
	await userRepository.create(dummyUser)
	getAccount = new GetAccountUseCase(userRepository, loggerPortMock)
	vi.clearAllMocks()
})

describe('GetAccount use case', () => {
	it('should get account details successfully', async () => {
		const outputGetAccount = await getAccount.execute(dummyUser.id)
		expect(outputGetAccount.id).toBe(dummyUser.id)
		expect(outputGetAccount.name).toBe(dummyUser.name)
		expect(outputGetAccount.email).toBe(dummyUser.email.value)
		expect(outputGetAccount.birthDate).toEqual(dummyUser.birthDate.value)
	})
	it('should throw an error if user not found', async () => {
		await expect(getAccount.execute('non-existing-id')).rejects.toThrow('User not found')
	})
})
