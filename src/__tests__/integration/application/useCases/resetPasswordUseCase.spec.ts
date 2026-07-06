import { hashPortMock } from '#application/ports/__mocks__/HashPortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { refreshTokenRepositoryMock } from '#application/ports/__mocks__/RefreshTokenRepositoryMock.js'
import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import ResetPasswordUseCase from '#application/useCases/auth/ResetPasswordUseCase.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let userRepository: UserRepositoryMemory
let resetPasswordUseCase: ResetPasswordUseCase
let dummyUser: User

tokenPortMock.verifyToken.mockImplementation((token) => {
	if (token === 'valid-token') {
		return { userId: dummyUser.id, email: dummyUser.email }
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
	resetPasswordUseCase = new ResetPasswordUseCase(
		userRepository,
		tokenPortMock,
		hashPortMock,
		refreshTokenRepositoryMock,
		loggerPortMock,
	)
	vi.clearAllMocks()
})

describe('ResetPassword use case', () => {
	it('should reset password successfully', async () => {
		const newPassword = 'NewValid@456'
		await resetPasswordUseCase.execute({ token: 'valid-token', newPassword })
		expect(hashPortMock.hash).toHaveBeenCalledWith(newPassword)
		expect(refreshTokenRepositoryMock.revokeAllByUserId).toHaveBeenCalledWith(dummyUser.id)
	})
	it('should update the user password hash', async () => {
		hashPortMock.hash.mockResolvedValueOnce('new-hashed-value')
		await resetPasswordUseCase.execute({ token: 'valid-token', newPassword: 'NewValid@456' })
		const updated = await userRepository.findById(dummyUser.id)
		expect(updated?.password).toBe('new-hashed-value')
	})
	it('should throw InvalidTokenError if token is invalid', async () => {
		await expect(
			resetPasswordUseCase.execute({ token: '', newPassword: 'NewValid@456' }),
		).rejects.toThrow('Invalid or expired token')
	})
	it('should throw UserNotFoundError if user does not exist', async () => {
		await expect(
			resetPasswordUseCase.execute({ token: 'invalid-user', newPassword: 'NewValid@456' }),
		).rejects.toThrow('User not found')
	})
	it('should throw InvalidTokenError if email does not match', async () => {
		await expect(
			resetPasswordUseCase.execute({ token: 'email-mismatch', newPassword: 'NewValid@456' }),
		).rejects.toThrow('Invalid or expired token')
	})
})
