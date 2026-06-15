import type { SignupInputDTO } from '#application/DTOs/SignupInputDTO.js'
import type { SignupOutputDTO } from '#application/DTOs/SignupOutputDTO.js'
import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import User from '#domain/user/User.js'
import type { MailPort } from '#application/ports/MailPort.js'
import type { TemplateRendererPort } from '#application/ports/TemplateRendererPort.js'
import argon2 from 'argon2'

class SignupUseCase {
	private _VERIFY_EMAIL_TOKEN_EXPIRE_TIME = 60 * 60 * 24
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
			throw new ResourceAlreadyExistsError('User with this email already exists')
		}
		const passwordHash = await argon2.hash(userData.password)
		const user = User.create(userData.name, userData.email, passwordHash, userData.birthDate)
		await this.userRepository.create(user)
		const token = this.tokenService.generateToken(
			{ userId: user.id, email: user.email.value },
			this._VERIFY_EMAIL_TOKEN_EXPIRE_TIME,
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

export default SignupUseCase
