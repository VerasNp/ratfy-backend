import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'
import { mailPortMock } from '#application/ports/__mocks__/MailPortMock.js'
import { templateRendererPortMock } from '#application/ports/__mocks__/TemplateRendererPortMock.js'
import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import GetAccountUseCase from '#application/useCases/user/GetAccountUseCase.js'
import SignupUseCase from '#application/useCases/user/SignupUseCase.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it } from 'vitest'

let signup: SignupUseCase
let dummyUser: User
let getAccount: GetAccountUseCase
beforeEach(async () => {
	const userRepository = new UserRepositoryMemory()
	dummyUser = User.create('Existing User', 'foo@bar.com', 'Valid@123', new Date('1990-01-01'))
	await userRepository.create(dummyUser)
	signup = new SignupUseCase(
		userRepository,
		mailPortMock,
		templateRendererPortMock,
		tokenPortMock,
		null as unknown as string,
		loggerPortMock,
	)
	getAccount = new GetAccountUseCase(userRepository, loggerPortMock)
})

describe('Signup use case', () => {
	it('should sign up a new user successfully', async () => {
		const signupInput = {
			name: 'Foo',
			email: 'foo2@bar.com',
			password: 'barfoo',
			birthDate: new Date('2000-01-01'),
		}
		const outputSignup = await signup.execute(signupInput)
		expect(outputSignup.id).toBeDefined()
		const outputGetAccount = await getAccount.execute(outputSignup.id)
		expect(outputGetAccount.id).toBe(outputSignup.id)
		expect(outputGetAccount.name).toBe(signupInput.name)
		expect(outputGetAccount.email).toBe(signupInput.email)
		expect(outputGetAccount.birthDate).toEqual(signupInput.birthDate)
	})
	it('should not sign up a user with an already registered email', async () => {
		const signupInput = {
			name: 'Foo',
			email: 'foo@bar.com',
			password: 'barfoo',
			birthDate: new Date('2000-01-01'),
		}
		await expect(signup.execute(signupInput)).rejects.toThrow(
			'User with this email already exists',
		)
	})
})
