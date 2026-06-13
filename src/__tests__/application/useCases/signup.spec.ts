import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import GetAccount from '#application/useCases/GetAccount.js'
import Signup from '#application/useCases/Signup.js'
import type { MailPort } from '#infra/mail/MailPort.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import type { TemplateRendererPort } from '#infra/templateRenderer/TemplateRendererPort.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let signup: Signup
let getAccount: GetAccount
beforeEach(() => {
	const userRepository = new UserRepositoryMemory()
	const mailService = {
		sendMail: vi.fn(),
	} as unknown as MailPort
	const templateRendererService = {
		render: vi.fn(),
	} as unknown as TemplateRendererPort
	const tokenService = {
		generateToken: vi.fn(),
	} as unknown as TokenPort
	const appUrl = 'http://localhost:3000'
	const loggerService = {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	} as unknown as LoggerPort
	signup = new Signup(userRepository, mailService, templateRendererService, tokenService, appUrl, loggerService)
	getAccount = new GetAccount(userRepository)
})

describe('Signup', () => {
	it('should sign up a new user successfully', async () => {
		const signupInput = {
			name: 'Foo',
			email: 'fooo@bar.com',
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
		await signup.execute(signupInput)
		await expect(signup.execute(signupInput)).rejects.toThrow('Resource already exists')
	})
})
