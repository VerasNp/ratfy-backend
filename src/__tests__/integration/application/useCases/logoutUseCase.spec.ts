import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import LogoutUseCase from '#application/useCases/auth/LogoutUseCase.js'
import { RefreshToken } from '#domain/refreshToken/RefreshToken.js'
import RefreshTokenRepositoryMemory from '#infra/repository/RefreshTokenRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let logoutUseCase: LogoutUseCase
let refreshTokenRepository: RefreshTokenRepositoryMemory
let dummyRefreshToken: RefreshToken

beforeEach(async () => {
	refreshTokenRepository = new RefreshTokenRepositoryMemory()
	vi.spyOn(refreshTokenRepository, 'revoke')
	dummyRefreshToken = RefreshToken.create(
		'valid-token',
		'user-id',
		new Date(Date.now() + 1000 * 60 * 60 * 24),
	)
	await refreshTokenRepository.create(dummyRefreshToken)
	logoutUseCase = new LogoutUseCase(refreshTokenRepository, loggerPortMock)
	vi.clearAllMocks()
})

describe('Logout use case', () => {
	it("should not revoke refresh token if it doesn't exist", async () => {
		await logoutUseCase.execute('non-existing-token')
		expect(refreshTokenRepository.revoke).not.toHaveBeenCalled()
	})

	it('should revoke the refresh token successfully', async () => {
		await logoutUseCase.execute('valid-token')
		expect(dummyRefreshToken.isRevoked()).toBe(true)
	})
})
