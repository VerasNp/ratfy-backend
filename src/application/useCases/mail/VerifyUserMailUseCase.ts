import type { VerifyEmailInputDTO } from '#application/DTOs/VerifyEmailInputDTO.js'
import InvalidTokenError from '#application/errors/InvalidTokenError.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class VerifyUserMailUseCase {
	public constructor(
		private userRepository: UserRepository,
		private tokenService: TokenPort,
		private loggerService: LoggerPort,
	) {}

	async execute(verifyEmailData: VerifyEmailInputDTO): Promise<void> {
		let payload
		try {
			payload = this.tokenService.verifyToken<{
				userId: string
				email: string
			}>(verifyEmailData.token)
		} catch {
			this.loggerService.warn('VerifyUserMailUseCase: Invalid or expired token', {
				token: verifyEmailData.token.slice(0, 10) + '...',
			})
			throw new InvalidTokenError()
		}
		const user = await this.userRepository.findById(payload.userId)
		if (!user) {
			this.loggerService.warn('VerifyUserMailUseCase: User not found', { userId: payload.userId })
			throw new UserNotFoundError()
		}
		if (user.email.value !== payload.email) {
			this.loggerService.error('VerifyUserMailUseCase: email mismatch', {
				userId: payload.userId,
				email: payload.email,
			})
			throw new InvalidTokenError()
		}
		if (!user.isEmailVerified()) {
			user.verifyEmail()
			await this.userRepository.update(user)
			this.loggerService.info('VerifyUserMailUseCase: email verified successfully', {
				userId: user.id,
			})
		} else {
			this.loggerService.warn('VerifyUserMailUseCase: user with email already verified', {
				userId: user.id,
			})
		}
	}
}

export default VerifyUserMailUseCase
