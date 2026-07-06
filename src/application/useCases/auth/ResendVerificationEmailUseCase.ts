import type { ResendVerificationEmailInputDTO } from '#application/DTOs/ResendVerificationEmailInputDTO.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import type { MailPort } from '#application/ports/MailPort.js'
import type { TemplateRendererPort } from '#application/ports/TemplateRendererPort.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'

class ResendVerificationEmailUseCase {
	public constructor(
		private userRepository: UserRepository,
		private tokenService: TokenPort,
		private templateRendererService: TemplateRendererPort,
		private mailService: MailPort,
		private appUrl: string,
		private loggerService: LoggerPort,
	) {}

	public async execute(input: ResendVerificationEmailInputDTO): Promise<void> {
		const user = await this.userRepository.findByEmail(input.email)
		if (!user) {
			this.loggerService.warn('ResendVerificationEmail: User not found', {
				email: input.email,
			})
			return
		}
		if (user.isEmailVerified()) {
			this.loggerService.warn('ResendVerificationEmail: User email already verified', {
				userId: user.id,
				email: user.email,
			})
			return
		}
		const token = this.tokenService.generateToken(
			{ userId: user.id, email: user.email },
			60 * 60 * 24,
		)
		const html = await this.templateRendererService.render('signup', {
			name: user.name,
			confirmationUrl: `${this.appUrl}/verify-email?token=${token}`,
		})
		await this.mailService.sendMail(user.email, 'Welcome to our app', html)
		this.loggerService.info('ResendVerificationEmail: Resent verification email', {
			userId: user.id,
			email: user.email,
		})
	}
}

export default ResendVerificationEmailUseCase
