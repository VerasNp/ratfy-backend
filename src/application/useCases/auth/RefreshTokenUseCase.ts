import InvalidTokenError from '#application/errors/InvalidTokenError.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RefreshTokenRepository } from '#application/ports/RefreshTokenRepository.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import { RefreshToken } from '#domain/refreshToken/RefreshToken.js'

class RefreshTokenUseCase {
	private _ACCESS_TOKEN_EXPIRE_TIME = 60 * 15
	private _REFRESH_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 7 * 1000
	public constructor(
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly loggerService: LoggerPort,
		private readonly tokenService: TokenPort,
	) {}

	public async execute(token: string): Promise<any> {
		if (!token) {
			this.loggerService.warn('RefreshTokenUseCase: No refresh token provided')
			throw new UnauthorizedError('Invalid or expired token')
		}
		const payload = this.tokenService.verifyToken<{ userId: string }>(token)
		const refreshToken = await this.refreshTokenRepository.findByTokenId(token)
		if (!refreshToken) {
			this.loggerService.warn('RefreshTokenUseCase: Refresh token not found', {
				token: token.slice(0, 10),
			})
			throw new InvalidTokenError()
		}
		if (refreshToken?.userId !== payload.userId) throw new InvalidTokenError()
		if (refreshToken.isRevoked()) {
			this.loggerService.warn('RefreshTokenUseCase: Refresh token is revoked', {
				userId: refreshToken.userId,
				token: token.slice(0, 10),
			})
			await this.refreshTokenRepository.revokeAllByUserId(refreshToken.id)
			this.loggerService.info('RefreshTokenUseCase: All refresh tokens revoked for user', {
				userId: refreshToken.userId,
			})
			throw new InvalidTokenError()
		}
		if (refreshToken.isExpired()) {
			this.loggerService.warn('RefreshTokenUseCase: Refresh token is expired', {
				userId: refreshToken.userId,
				token: token.slice(0, 10),
			})
			throw new InvalidTokenError()
		}
		const foundRefreshToken = await this.refreshTokenRepository.findByUserId(
			refreshToken.userId,
		)
		await this.refreshTokenRepository.revoke(refreshToken.id)
		const sevenDaysToExpire = this._REFRESH_TOKEN_EXPIRE_TIME
		const newRefreshToken = this.tokenService.generateToken(
			{ userId: foundRefreshToken!.userId },
			sevenDaysToExpire,
		)
		const newRefreshTokenEntity = RefreshToken.create(
			newRefreshToken,
			foundRefreshToken!.userId,
			new Date(Date.now() + sevenDaysToExpire),
		)
		await this.refreshTokenRepository.create(newRefreshTokenEntity)
		const fifteenMinutesToExpire = this._ACCESS_TOKEN_EXPIRE_TIME
		const accessToken = this.tokenService.generateToken(
			{ userId: foundRefreshToken!.userId },
			fifteenMinutesToExpire,
		)
		this.loggerService.info('RefreshToken: rotated successfully', {
			userId: foundRefreshToken!.userId,
		})
		return { accessToken, refreshToken: newRefreshToken }
	}
}

export default RefreshTokenUseCase
