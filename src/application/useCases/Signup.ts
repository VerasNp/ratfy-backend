import type { SignupInputDTO } from '#application/DTOs/SignupInputDTO.js'
import type { SignupOutputDTO } from '#application/DTOs/SignupOutputDTO.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import User from '#domain/user/User.js'
import HttpError from '#infra/http/errors/toHttpErrors.js'
import type { MailPort } from '#infra/mail/MailPort.js'
import type { TemplateRendererPort } from '#infra/templateRenderer/TemplateRendererPort.js'
import argon2 from 'argon2'

class Signup {
	public constructor(
		private userRepository: UserRepository,
		private mailService: MailPort,
		private templateRendererService: TemplateRendererPort,
		private tokenService: TokenPort,
		private appUrl: string,
		private loggerService: LoggerPort,
	) {}

	async execute(userData: SignupInputDTO): Promise<SignupOutputDTO> {
		const existingUser = await this.userRepository.findByEmail(userData.email)
		if (existingUser) {
			this.loggerService.warn('Attempt to register with an already used email', {
				email: userData.email,
			})
			throw new ResourceAlreadyExistsError()
		}
		const passwordHash = await argon2.hash(userData.password)
		const user = User.create(userData.name, userData.email, passwordHash, userData.birthDate)
		await this.userRepository.create(user)
		const token = this.tokenService.generateToken(
			{ userId: user.id, email: user.email.value },
			60 * 60 * 24,
		)
		const html = await this.templateRendererService.render('signup', {
			name: userData.name,
			confirmationUrl: `${this.appUrl}/verify-email?token=${token}`,
		})
		await this.mailService.sendMail(userData.email, 'Welcome to our app', html)
		this.loggerService.info('New user registered', {
			userId: user.id,
			email: user.email.value,
		})
		return {
			id: user.id,
		}
	}
}

export default Signup
