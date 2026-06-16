import type { LoginInputDTO } from '#application/DTOs/LoginInputDTO.js'
import type { LoginOutputDTO } from '#application/DTOs/LoginOutputDTO.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'
import type { HashPort } from '#application/ports/HashPort.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RefreshTokenRepository } from '#application/ports/RefreshTokenRepository.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import { RefreshToken } from '#domain/refreshToken/RefreshToken.js'

class LoginUseCase {
	private _ACCESS_TOKEN_EXPIRE_TIME = 60 * 15
	private _REFRESH_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 7 * 1000
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly tokenService: TokenPort,
		private readonly loggerService: LoggerPort,
		private readonly hashService: HashPort,
	) {}

	public async execute(loginInput: LoginInputDTO): Promise<LoginOutputDTO> {
		const user = await this.userRepository.findByEmail(loginInput.email)
		if (!user) {
			this.loggerService.warn('LoginUseCase: Login attempt with non-existent email', {
				email: loginInput.email,
			})
			throw new UnauthorizedError('Invalid email or password')
		}
		const isPasswordValid = await this.hashService.compare(
			loginInput.password,
			user.password.value,
		)
		if (!isPasswordValid) {
			this.loggerService.warn('LoginUseCase: Login attempt with invalid password', {
				email: loginInput.email,
			})
			throw new UnauthorizedError('Invalid email or password')
		}
		if (!user.isEmailVerified()) {
			this.loggerService.warn('LoginUseCase: Login attempt with unverified email', {
				email: loginInput.email,
			})
			throw new UnauthorizedError('Email not verified')
		}
		const existingRefreshToken = await this.refreshTokenRepository.findByUserId(user.id)
		if (existingRefreshToken) {
			await this.refreshTokenRepository.revoke(existingRefreshToken.id)
		}
		const fifteenMinutesToExpire = this._ACCESS_TOKEN_EXPIRE_TIME
		const accessToken = this.tokenService.generateToken(
			{ userId: user.id, email: user.email.value },
			fifteenMinutesToExpire,
		)
		const sevenDaysToExpire = this._REFRESH_TOKEN_EXPIRE_TIME
		const refreshToken = this.tokenService.generateToken({ userId: user.id }, sevenDaysToExpire)
		const refreshTokenEntity = RefreshToken.create(
			refreshToken,
			user.id,
			new Date(Date.now() + sevenDaysToExpire),
		)
		await this.refreshTokenRepository.create(refreshTokenEntity)
		this.loggerService.info('LoginUseCase: User logged in successfully', {
			email: loginInput.email,
		})
		return { accessToken, refreshToken }
	}
}

export default LoginUseCase
