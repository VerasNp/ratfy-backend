import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RefreshTokenRepository } from '#application/ports/RefreshTokenRepository.js'

class LogoutUseCase {
	public constructor(
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly loggerService: LoggerPort,
	) {}

	public async execute(token: string): Promise<void> {
		const refreshToken = await this.refreshTokenRepository.findByTokenId(token)
		if (!refreshToken) {
			this.loggerService.warn('LogoutUseCase: Refresh token not found', {
				token: token.slice(0, 10),
			})
			return
		}
		await this.refreshTokenRepository.revoke(refreshToken.id)
		this.loggerService.info('LogoutUseCase: Refresh token revoked successfully', {
			userId: refreshToken.userId,
			token: token.slice(0, 10),
		})
	}
}

export default LogoutUseCase
