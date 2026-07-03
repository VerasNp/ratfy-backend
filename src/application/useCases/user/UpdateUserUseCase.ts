import type { UserUpdateInputDTO } from '#application/DTOs/user/UserUpdateInputDTO.js'
import type { UserUpdateOutputDTO } from '#application/DTOs/user/UserUpdateOutputDTO.js'
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
import argon2 from 'argon2'

class UpdateUserUseCase {
	private readonly _VERIFY_EMAIL_TOKEN_EXPIRE_TIME = 60 * 60 * 24

	public constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerPort,
		private readonly tokenService: TokenPort,
		private readonly mailService: MailPort,
		private readonly templateRendererService: TemplateRendererPort,
		private readonly appUrl: string,
	) {}

	public async execute(id: string, dto: UserUpdateInputDTO): Promise<UserUpdateOutputDTO> {
		const user = await this.userRepository.findById(id)
		if (!user) {
			this.loggerService.warn('UpdateUserUseCase: user not found', { userId: id })
			throw new UserNotFoundError()
		}

		let emailChanged = false

		if (dto.email !== undefined && dto.email !== user.email.value) {
			const existingUser = await this.userRepository.findByEmail(dto.email)
			if (existingUser) {
				this.loggerService.warn('UpdateUserUseCase: email already in use', {
					userId: id,
					email: dto.email,
				})
				throw new ResourceAlreadyExistsError('User with this email already exists')
			}
			user.email = new Email(dto.email)
			user.verifiedAt = null
			emailChanged = true
		}

		if (dto.password !== undefined) {
			try {
				Password.create(dto.password)
			} catch {
				throw new ValidationError(
					'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
				)
			}
			const passwordHash = await argon2.hash(dto.password)
			user.changePassword(passwordHash)
		}

		if (dto.name !== undefined) {
			user.name = dto.name
		}

		if (dto.birthDate !== undefined) {
			user.birthDate = new BirthDate(dto.birthDate)
		}

		let updatedUser: User
		try {
			const result = await this.userRepository.updateUser(user)
			if (!result) {
				this.loggerService.error('UpdateUserUseCase: failed to update user', { userId: id })
				throw new UserNotFoundError()
			}
			updatedUser = result
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				this.loggerService.warn('UpdateUserUseCase: email already in use (race condition)', {
					userId: id,
					email: dto.email,
				})
				throw new ResourceAlreadyExistsError('User with this email already exists')
			}
			throw error
		}

		if (emailChanged) {
			await this.sendVerificationEmail(updatedUser)
		}

		this.loggerService.info('UpdateUserUseCase: user updated successfully', { userId: id })

		return {
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email.value,
			birthDate: updatedUser.birthDate.value,
		}
	}

	private async sendVerificationEmail(user: User): Promise<void> {
		const token = this.tokenService.generateToken(
			{ userId: user.id, email: user.email.value },
			this._VERIFY_EMAIL_TOKEN_EXPIRE_TIME,
		)
		const html = await this.templateRendererService.render('signup', {
			name: user.name,
			confirmationUrl: `${this.appUrl}/verify-email?token=${token}`,
		})
		await this.mailService.sendMail(user.email.value, 'Verify your new email', html)
	}
}

export default UpdateUserUseCase
