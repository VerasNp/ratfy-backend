import type { ForgotPasswordInputDTO } from '#application/DTOs/ForgotPasswordInputDTO.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { MailPort } from '#application/ports/MailPort.js'
import type { TemplateRendererPort } from '#application/ports/TemplateRendererPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'

class ForgotPasswordUseCase {
	private _RESET_TOKEN_EXPIRE_TIME = 60 * 60

	public constructor(
		private userRepository: UserRepository,
		private tokenService: TokenPort,
		private templateRendererService: TemplateRendererPort,
		private mailService: MailPort,
		private appUrl: string,
		private loggerService: LoggerPort,
	) {}

	public async execute(input: ForgotPasswordInputDTO): Promise<void> {
		const user = await this.userRepository.findByEmail(input.email)
		if (!user) {
			this.loggerService.warn('ForgotPassword: User not found', {
				email: input.email,
			})
			return
		}

		const token = this.tokenService.generateToken(
			{ userId: user.id, email: user.email },
			this._RESET_TOKEN_EXPIRE_TIME,
		)

		const html = await this.templateRendererService.render('password-reset', {
			name: user.name,
			resetUrl: `${this.appUrl}/reset-password?token=${token}`,
		})

		await this.mailService.sendMail(
			user.email,
			'Password Reset Request',
			html,
		)

		this.loggerService.info('ForgotPassword: Reset email sent', {
			userId: user.id,
			email: user.email,
		})
	}
}

export default ForgotPasswordUseCase
