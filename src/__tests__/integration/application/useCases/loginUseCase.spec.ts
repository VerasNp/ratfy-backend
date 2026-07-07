import { hashPortMock } from '#application/ports/__mocks__/HashPortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { refreshTokenRepositoryMock } from '#application/ports/__mocks__/RefreshTokenRepositoryMock.js'
import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import LoginUseCase from '#application/useCases/auth/LoginUseCase.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('#application/ports/LoggerPort')
vi.mock('#application/ports/RefreshTokenRepository')
vi.mock('#application/ports/TokenPort')
vi.mock('#application/ports/HashPort')

let loginUserCase: LoginUseCase
let dummyUserWithVerifiedEmail: User
let dummyUserWithUnverifiedEmail: User

beforeAll(async () => {
	const userRepository = new UserRepositoryMemory()
	dummyUserWithVerifiedEmail = User.create(
		'Existing User',
		'foo@bar.com',
		'Valid@123',
		new Date('1990-01-01'),
	)
	dummyUserWithVerifiedEmail.verifyEmail()
	await userRepository.create(dummyUserWithVerifiedEmail)
	dummyUserWithUnverifiedEmail = User.create(
		'Existing User 2',
		'foo2@bar.com',
		'Valid@123',
		new Date('1990-01-01'),
	)
	await userRepository.create(dummyUserWithUnverifiedEmail)
	loginUserCase = new LoginUseCase(
		userRepository,
		refreshTokenRepositoryMock,
		tokenPortMock,
		loggerPortMock,
		hashPortMock,
	)
	vi.clearAllMocks()
})

describe('Login use case', () => {
	it('should not login a user with non-existent email', async () => {
		const input = {
			email: 'foo@bar2.com',
			password: 'Valid@123',
		}
		await expect(loginUserCase.execute(input)).rejects.toThrow('Invalid email or password')
	})
	it('should not login a user with invalid password', async () => {
		const input = {
			email: dummyUserWithVerifiedEmail.email,
			password: 'InvalidPassword',
		}
		hashPortMock.compare.mockResolvedValueOnce(false)
		await expect(loginUserCase.execute(input)).rejects.toThrow('Invalid email or password')
	})
	it('should not login a user with unverified email', async () => {
		const input = {
			email: dummyUserWithUnverifiedEmail.email,
			password: 'Valid@123',
		}
		hashPortMock.compare.mockResolvedValueOnce(true)
		await expect(loginUserCase.execute(input)).rejects.toThrow('Email not verified')
	})
	it('should login successfully', async () => {
		const input = {
			email: dummyUserWithVerifiedEmail.email,
			password: dummyUserWithVerifiedEmail.password,
		}
		hashPortMock.compare.mockResolvedValueOnce(true)
		const output = await loginUserCase.execute(input)
		expect(output).toHaveProperty('accessToken')
		expect(output).toHaveProperty('refreshToken')
	})
})
