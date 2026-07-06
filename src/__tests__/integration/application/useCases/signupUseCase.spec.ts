import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { mailPortMock } from '#application/ports/__mocks__/MailPortMock.js'
import { templateRendererPortMock } from '#application/ports/__mocks__/TemplateRendererPortMock.js'
import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import { unitOfWorkMock } from '#application/ports/__mocks__/UnitOfWorkMock.js'
import type { UserRoleRepository } from '#application/ports/UserRoleRepository.js'
import UniqueConstraintError from '#domain/errors/UniqueConstraintError.js'
import SignupUseCase from '#application/useCases/user/SignupUseCase.js'
import Role from '#domain/rbac/role/Role.js'
import User from '#domain/user/User.js'
import RoleRepositoryMemory from '#infra/repository/rbac/RoleRepositoryMemory.js'
import UserRoleRepositoryMemory from '#infra/repository/rbac/UserRoleRepositoryMemory.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'
import type { UserRepository } from '#application/ports/UserRepository.js'
import { createDummyRole } from '#__tests__/factories/RoleFactory.js'
import type { RoleRepository } from '#application/ports/RoleRepository.js'

let signupUseCase: SignupUseCase
let userRepository: UserRepository
let userRoleRepository: UserRoleRepository
let roleRepository: RoleRepository

describe('SignupUseCase', () => {
	let userRole: Role
	beforeEach(() => {
		userRole = createDummyRole({
			name: Role.PredefinedRoles.USER,
			description: 'Regular user role',
		})
		userRoleRepository = new UserRoleRepositoryMemory([userRole])
		userRepository = new UserRepositoryMemory()
		roleRepository = new RoleRepositoryMemory([userRole])
		signupUseCase = new SignupUseCase(
			userRepository,
			mailPortMock,
			templateRendererPortMock,
			tokenPortMock,
			null as unknown as string,
			loggerPortMock,
			roleRepository,
			unitOfWorkMock,
			userRoleRepository,
		)
	})
	it('should sign up a new user successfully', async () => {
		const input = {
			name: 'Foo',
			email: 'foo2@bar.com',
			password: 'Valid@123',
			birthDate: new Date('2000-01-01'),
		}
		const output = await signupUseCase.execute(input)
		expect(output.name).toBe(input.name)
		expect(output.email).toBe(input.email)
		expect(output.birthDate).toEqual(input.birthDate)
		expect(output.verifiedAt).toBeNull()
	})
	it('should not sign up a user if the user role is not configured on the system', async () => {
		const signupInput = {
			name: 'Foo',
			email: 'foo@bar.com',
			password: 'Valid@123',
			birthDate: new Date('2000-01-01'),
		}
		const roleRepository = new RoleRepositoryMemory()
		signupUseCase = new SignupUseCase(
			new UserRepositoryMemory(),
			mailPortMock,
			templateRendererPortMock,
			tokenPortMock,
			null as unknown as string,
			loggerPortMock,
			roleRepository,
			unitOfWorkMock,
			userRoleRepository,
		)
		await expect(signupUseCase.execute(signupInput)).rejects.toThrow('Internal server error')
	})

	it('should not sign up a user with an already registered email', async () => {
		const signupInput = {
			name: 'Foo',
			email: 'foo@bar.com',
			password: 'Valid@123',
			birthDate: new Date('2000-01-01'),
		}
		await signupUseCase.execute(signupInput)
		await expect(signupUseCase.execute(signupInput)).rejects.toThrow(
			'User with this email already exists',
		)
	})

	it('should throw UniqueConstraintError when email uniqueness is violated at repository level', async () => {
		unitOfWorkMock.execute.mockRejectedValueOnce(
			new UniqueConstraintError('email already exists'),
		)
		const input = User.create('Duplicate', 'foo@bar.com', 'Valid@123', new Date('1990-01-01'))
		await expect(signupUseCase.execute(input)).rejects.toThrow(
			'User with this email already exists',
		)
	})
})
