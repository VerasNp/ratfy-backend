import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import VerifyUserMailUseCase from '#application/useCases/mail/VerifyUserMailUseCase.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let userRepository: UserRepositoryMemory
let verifyUserMailUseCase: VerifyUserMailUseCase
let dummyUser: User

tokenPortMock.verifyToken.mockImplementation((token) => {
	if (token === 'fake-token') {
		return { userId: dummyUser.id, email: dummyUser.email.value }
	} else if (token === 'invalid-user') {
		return { userId: 'non-existing-id', email: 'nonexistent@bar.com' }
	} else if (token === 'email-mismatch') {
		return { userId: dummyUser.id, email: 'different@bar.com' }
	} else {
		throw new Error()
	}
})

beforeEach(() => {
	userRepository = new UserRepositoryMemory()
	dummyUser = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
	userRepository.create(dummyUser)
	verifyUserMailUseCase = new VerifyUserMailUseCase(userRepository, tokenPortMock, loggerPortMock)
	vi.clearAllMocks()
})

describe('VerifyUserMail use case', () => {
	it('should verify the user email', async () => {
		await verifyUserMailUseCase.execute({ token: 'fake-token' })
		const updated = await userRepository.findById(dummyUser.id)
		expect(updated?.verifiedAt).not.toBeNull()
	})
	it('should throw an error if the token is invalid', async () => {
		await expect(verifyUserMailUseCase.execute({ token: '' })).rejects.toThrow(
			'Invalid or expired token',
		)
	})
	it('should throw an error if the user does not exist', async () => {
		await expect(verifyUserMailUseCase.execute({ token: 'invalid-user' })).rejects.toThrow(
			'User not found',
		)
	})
	it('should throw an error if the token email does not match user email', async () => {
		await expect(verifyUserMailUseCase.execute({ token: 'email-mismatch' })).rejects.toThrow(
			'Invalid or expired token',
		)
	})
})
