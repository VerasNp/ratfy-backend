import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import VerifyUserMail from '#application/useCases/VerifyUserMail.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let userRepository: UserRepositoryMemory
let verifyUserMail: VerifyUserMail
let tokenService: TokenPort
let loggerService: LoggerPort

const makeTokenService = (payload: object | null = null) =>
	({
		signToken: vi.fn().mockReturnValue('fake-token'),
		verifyToken: payload
			? vi.fn().mockReturnValue(payload)
			: vi.fn().mockImplementation(() => {
					throw new Error('Invalid token')
				}),
	}) as unknown as TokenPort

beforeEach(() => {
	loggerService = {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	} as unknown as LoggerPort
	userRepository = new UserRepositoryMemory()
})

describe('VerifyUserMail use case', () => {
	it('should verify the user email', async () => {
		const user = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
		await userRepository.create(user)
		tokenService = makeTokenService({ userId: user.id, email: 'foo@bar.com' })
		verifyUserMail = new VerifyUserMail(userRepository, tokenService, loggerService)
		await verifyUserMail.execute({ token: 'fake-token' })
		const updated = await userRepository.findById(user.id)
		expect(updated?.verifiedAt).not.toBeNull()
	})
	it('should throw an error if the token is invalid', async () => {
		tokenService = makeTokenService()
		verifyUserMail = new VerifyUserMail(userRepository, tokenService, loggerService)
		await expect(verifyUserMail.execute({ token: 'invalid-token' })).rejects.toThrow(
			'Invalid or expired token',
		)
	})
	it('should throw an error if the user does not exist', async () => {
		tokenService = makeTokenService({ userId: 'nonexistent-id', email: 'nonexistent@bar.com' })
		verifyUserMail = new VerifyUserMail(userRepository, tokenService, loggerService)
		await expect(verifyUserMail.execute({ token: 'fake-token' })).rejects.toThrow(
			'User not found',
		)
	})
	it('should throw an error if the token email does not match user email', async () => {
		const user = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
		await userRepository.create(user)
		tokenService = makeTokenService({ userId: user.id, email: 'different@bar.com' })
		verifyUserMail = new VerifyUserMail(userRepository, tokenService, loggerService)
		await expect(verifyUserMail.execute({ token: 'fake-token' })).rejects.toThrow(
			'Invalid or expired token',
		)
	})
})
