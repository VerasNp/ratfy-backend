import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import UserNotFoundError from '#application/errors/UserNotFoundError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { MailPort } from '#application/ports/MailPort.js'
import type { TemplateRendererPort } from '#application/ports/TemplateRendererPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import UniqueConstraintError from '#domain/errors/UniqueConstraintError.js'
import ValidationError from '#domain/errors/ValidationError.js'
import type User from '#domain/user/User.js'
import BirthDate from '#domain/user/BirthDate.js'
import Email from '#domain/shared/Email.js'
import Password from '#domain/user/Password.js'
import type { HashPort } from '#application/ports/HashPort.js'

class UpdateUserUseCase {
	private readonly _VERIFY_EMAIL_TOKEN_EXPIRE_TIME = 60 * 60 * 24

	public constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
		private readonly tokenService: TokenPort,
		private readonly mailService: MailPort,
		private readonly templateRendererService: TemplateRendererPort,
		private readonly appUrl: string,
		private readonly hashService: HashPort,
	) {}

	public async execute(userId: string, input: Input): Promise<Output> {
		const user = await this.userRepository.findById(userId)
		if (!user) {
			this.loggerService.warn('UpdateUserUseCase: user not found', { userId: userId })
			throw new UserNotFoundError()
		}
		let emailChanged = false
		if (input.email !== undefined && input.email !== user.email) {
			const existingUser = await this.userRepository.findByEmail(input.email)
			if (existingUser) {
				this.loggerService.warn('UpdateUserUseCase: email already in use', {
					userId: userId,
					email: input.email,
				})
				throw new ResourceAlreadyExistsError('User with this email already exists')
			}
			user.changeEmail(input.email)
			emailChanged = true
		}
		if (input.password !== undefined) {
			Password.create(input.password)
			const passwordHash = await this.hashService.hash(input.password)
			user.changePassword(passwordHash)
		}
		user.updateData(input)
		let updatedUser: User
		try {
			const result = await this.userRepository.updateUser(user)
			if (!result) {
				this.loggerService.error('UpdateUserUseCase: failed to update user', {
					userId: userId,
				})
				throw new UserNotFoundError()
			}
			updatedUser = result
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				this.loggerService.warn(
					'UpdateUserUseCase: email already in use (race condition)',
					{
						userId: userId,
						email: input.email,
					},
				)
				throw new ResourceAlreadyExistsError('User with this email already exists')
			}
			throw error
		}
		if (emailChanged) {
			await this.sendVerificationEmail(updatedUser)
		}
		this.loggerService.info('UpdateUserUseCase: user updated successfully', { userId: userId })
		return {
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			birthDate: updatedUser.birthDate,
		}
	}

	private async sendVerificationEmail(user: User): Promise<void> {
		const token = this.tokenService.generateToken(
			{ userId: user.id, email: user.email },
			this._VERIFY_EMAIL_TOKEN_EXPIRE_TIME,
		)
		const html = await this.templateRendererService.render('signup', {
			name: user.name,
			confirmationUrl: `${this.appUrl}/verify-email?token=${token}`,
		})
		await this.mailService.sendMail(user.email, 'Verify your new email', html)
	}
}

export default UpdateUserUseCase

type Input = {
	name?: string | undefined
	email?: string | undefined
	password?: string | undefined
	birthDate?: Date | undefined
}

type Output = {
	id: string
	name: string
	email: string
	birthDate: Date
}
