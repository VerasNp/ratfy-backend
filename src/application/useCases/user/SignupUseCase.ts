import ResourceAlreadyExistsError from '#application/errors/ResourceAlreadyExistsError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { UserRepository } from '#application/ports/UserRepository.js'
import User from '#domain/user/User.js'
import type { MailPort } from '#application/ports/MailPort.js'
import type { TemplateRendererPort } from '#application/ports/TemplateRendererPort.js'
import UniqueConstraintError from '#domain/errors/UniqueConstraintError.js'
import argon2 from 'argon2'
import type { RoleRepository } from '#application/ports/RoleRepository.js'
import type { UnitOfWork } from '#application/ports/UnitOfWork.js'
import type { UserRoleRepository } from '#application/ports/UserRoleRepository.js'
import MissingApplicationSetupError from '#application/errors/MissingApplicationSetupError.js'
import Role from '#domain/rbac/role/Role.js'

class SignupUseCase {
	private _VERIFY_EMAIL_TOKEN_EXPIRE_TIME = 60 * 60 * 24
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly mailService: MailPort,
		private readonly templateRendererService: TemplateRendererPort,
		private readonly tokenService: TokenPort,
		private readonly appUrl: string,
		private readonly loggerService: LoggerPort,
		private readonly roleRepository: RoleRepository,
		private readonly unitOfWork: UnitOfWork,
		private readonly userRoleRepository: UserRoleRepository,
	) {}

	public async execute(input: Input): Promise<Output> {
		const existingUser = await this.userRepository.findByEmail(input.email)
		if (existingUser) {
			this.loggerService.warn('Attempt to register with an already used email', {
				origin: 'SignupUseCase',
				email: input.email,
			})
			throw new ResourceAlreadyExistsError('User with this email already exists')
		}
		const userRole = await this.roleRepository.findRoleByName(Role.PredefinedRoles.USER)
		if (!userRole) {
			this.loggerService.error('The user role does not exists on the system', {
				origin: 'SignupUseCase',
				email: input.email,
			})
			throw new MissingApplicationSetupError('Internal server error')
		}
		const passwordHash = await argon2.hash(input.password)
		const user = User.create(input.name, input.email, passwordHash, input.birthDate)
		try {
			await this.unitOfWork.execute(async (tx) => {
				await this.userRepository.create(user, tx)
				await this.userRoleRepository.assignRoleToUser(user.id, userRole.id, tx)
			})
			user.assignRole(userRole)
		} catch (error) {
			if (error instanceof UniqueConstraintError) {
				this.loggerService.warn('SignupUseCase: email already in use (race condition)', {
					origin: 'SignupUseCase',
					email: input.email,
				})
				throw new ResourceAlreadyExistsError('User with this email already exists')
			}
			throw error
		}
		const token = this.tokenService.generateToken(
			{ userId: user.id, email: user.email },
			this._VERIFY_EMAIL_TOKEN_EXPIRE_TIME,
		)
		const html = await this.templateRendererService.render('signup', {
			name: input.name,
			confirmationUrl: `${this.appUrl}/verify-email?token=${token}`,
		})
		await this.mailService.sendMail(input.email, 'Welcome to our app', html)
		this.loggerService.info('New user registered', {
			origin: 'SignupUseCase',
			email: input.email,
		})
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			birthDate: user.birthDate,
			verifiedAt: user.verifiedAt,
			roles: user.roles,
		}
	}
}

export default SignupUseCase

type Input = {
	name: string
	email: string
	password: string
	birthDate: Date
}

type Output = {
	id: string
	name: string
	email: string
	birthDate: Date
	verifiedAt: Date | null
	roles: Role[]
}
