import type { ResendVerificationEmailInputDTO } from '#application/DTOs/ResendVerificationEmailInputDTO.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import type { MailPort } from '#infra/mail/MailPort.js'
import type { TemplateRendererPort } from '#infra/templateRenderer/TemplateRendererPort.js'

class ResendVerificationEmail {
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
		if (!user || user.verifiedAt) {
			this.loggerService.warn(
				'ResendVerificationEmail: user not found or email already verified',
				{
					email: input.email,
				},
			)
			return
		}
		const token = this.tokenService.generateToken(
			{ userId: user.id, email: user.email.value },
			60 * 60 * 24,
		)
		const html = await this.templateRendererService.render('signup', {
			name: user.name,
			confirmationUrl: `${this.appUrl}/verify-email?token=${token}`,
		})
		await this.mailService.sendMail(user.email.value, 'Welcome to our app', html)
		this.loggerService.info('Resent verification email', {
			userId: user.id,
			email: user.email.value,
		})
	}
}

export default ResendVerificationEmail
