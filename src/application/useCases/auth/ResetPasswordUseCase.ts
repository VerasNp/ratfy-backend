import type { ResetPasswordInputDTO } from '#application/DTOs/ResetPasswordInputDTO.js'
import InvalidTokenError from '#application/errors/InvalidTokenError.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import type { HashPort } from '#application/ports/HashPort.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { RefreshTokenRepository } from '#application/ports/RefreshTokenRepository.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class ResetPasswordUseCase {
	public constructor(
		private userRepository: UserRepository,
		private tokenService: TokenPort,
		private hashService: HashPort,
		private refreshTokenRepository: RefreshTokenRepository,
		private loggerService: LoggerPort,
	) {}

	public async execute(input: ResetPasswordInputDTO): Promise<void> {
		let payload
		try {
			payload = this.tokenService.verifyToken<{
				userId: string
				email: string
			}>(input.token)
		} catch {
			this.loggerService.warn('ResetPassword: Invalid or expired token', {
				token: input.token.slice(0, 10) + '...',
			})
			throw new InvalidTokenError()
		}

		const user = await this.userRepository.findById(payload.userId)
		if (!user) {
			this.loggerService.warn('ResetPassword: User not found', {
				userId: payload.userId,
			})
			throw new UserNotFoundError()
		}

		if (user.email.value !== payload.email) {
			this.loggerService.error('ResetPassword: Email mismatch', {
				userId: payload.userId,
				email: payload.email,
			})
			throw new InvalidTokenError()
		}

		const hashedPassword = await this.hashService.hash(input.newPassword)
		user.changePassword(hashedPassword)
		await this.userRepository.updateUser(user)

		await this.refreshTokenRepository.revokeAllByUserId(user.id)

		this.loggerService.info('ResetPassword: Password reset successfully', {
			userId: user.id,
		})
	}
}

export default ResetPasswordUseCase
