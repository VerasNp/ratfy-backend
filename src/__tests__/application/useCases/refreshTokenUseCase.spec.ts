import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import RefreshTokenUseCase from '#application/useCases/RefreshTokenUseCase.js'
import { RefreshToken } from '#domain/refreshToken/RefreshToken.js'
import RefreshTokenRepositoryMemory from '#infra/repository/RefreshTokenRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let refreshTokenUseCase: RefreshTokenUseCase
let refreshTokenRepository: RefreshTokenRepositoryMemory
let dummyRefreshToken: RefreshToken

beforeEach(async () => {
	refreshTokenRepository = new RefreshTokenRepositoryMemory()
	dummyRefreshToken = RefreshToken.create(
		'valid-token',
		'user-id',
		new Date(Date.now() + 1000 * 60 * 60 * 24),
	)
	tokenPortMock.verifyToken.mockReturnValue({ userId: 'user-id' })
	await refreshTokenRepository.create(dummyRefreshToken)
	refreshTokenUseCase = new RefreshTokenUseCase(
		refreshTokenRepository,
		loggerPortMock,
		tokenPortMock,
	)
	vi.clearAllMocks()
})

describe('RefreshToken use case', () => {
	it('should not refresh token if not found', async () => {
		await expect(refreshTokenUseCase.execute('')).rejects.toThrow('Invalid or expired token')
	})

	it('should not refresh token if revoked', async () => {
		await refreshTokenRepository.revoke(dummyRefreshToken.id)
		await expect(refreshTokenUseCase.execute(dummyRefreshToken.token)).rejects.toThrow(
			'Invalid or expired token',
		)
	})

	it('should not refresh token if expired', async () => {
		const expiredDummyRefreshToken = RefreshToken.create(
			'valid-token2',
			'user-id2',
			new Date(Date.now() - 1000 * 60 * 60 * 24),
		)
		await refreshTokenRepository.create(expiredDummyRefreshToken)
		await expect(refreshTokenUseCase.execute(expiredDummyRefreshToken.token)).rejects.toThrow(
			'Invalid or expired token',
		)
	})

	it('should refresh token successfully', async () => {
		const rotatedTokens = await refreshTokenUseCase.execute(dummyRefreshToken.token)
		expect(rotatedTokens).toHaveProperty('accessToken')
		expect(rotatedTokens).toHaveProperty('refreshToken')
		expect(dummyRefreshToken.isRevoked()).toBe(true)
	})
})
