import { beforeAll, describe, expect, it, test, vi } from 'vitest'
import request from 'supertest'
import type { TokenPort } from '#application/ports/TokenPort.js'
import ResendVerificationEmail from '#application/useCases/ResendVerificationEmail.js'
import Signup from '#application/useCases/Signup.js'
import VerifyUserMail from '#application/useCases/VerifyUserMail.js'
import UserController from '#infra/controllers/UserController.js'
import ExpressAdapter from '#infra/http/ExpressAdapter.js'
import type { MailPort } from '#infra/mail/MailPort.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import type { TemplateRendererPort } from '#infra/templateRenderer/TemplateRendererPort.js'
import VerifyEmailController from '#infra/controllers/VerifyEmailController.js'
import User from '#domain/user/User.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { DocsPort } from '#application/ports/DocsPort.js'

let app: ExpressAdapter
let tokenService: TokenPort
let userRepository: UserRepositoryMemory

beforeAll(() => {
	userRepository = new UserRepositoryMemory()
	const mailService = {
		sendMail: vi.fn().mockResolvedValue(undefined),
	} as unknown as MailPort
	const templateRendererService = {
		render: vi.fn().mockResolvedValue('<html>Welcome</html>'),
	} as unknown as TemplateRendererPort
	tokenService = {
		generateToken: vi.fn().mockReturnValue('fake-token'),
		verifyToken: vi.fn().mockReturnValue({ userId: '123', email: 'foo@bar.com' }),
	} as unknown as TokenPort
	const loggerService = {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	} as unknown as LoggerPort
	const docsService = {
		generate: vi.fn().mockReturnValue({}),
	} as unknown as DocsPort
	app = new ExpressAdapter(3333, docsService)

	const signupUseCase = new Signup(
		userRepository,
		mailService,
		templateRendererService,
		tokenService,
		'http://localhost:3000',
		loggerService,
	)
	const verifyEmailUseCase = new VerifyUserMail(userRepository, tokenService, loggerService)
	const resendVerificationEmailUseCase = new ResendVerificationEmail(
		userRepository,
		tokenService,
		templateRendererService,
		mailService,
		'http://localhost:3000',
		loggerService,
	)

	new UserController(signupUseCase, app)
	new VerifyEmailController(app, verifyEmailUseCase, resendVerificationEmailUseCase)
})

describe('GET /verify-email', () => {
	it('returns 200 with success message on valid token', async () => {
		const user = User.create('Foo', 'verify@bar.com', 'Valid@123', new Date('2000-01-01'))
		await userRepository.create(user)
		;(tokenService.verifyToken as any).mockReturnValue({
			userId: user.id,
			email: 'verify@bar.com',
		})

		const res = await request(app.app).get('/verify-email?token=fake-token')
		expect(res.status).toBe(200)
		expect(res.body.message).toBe('Email verified successfully')
	})

	it('returns 401 on invalid token', async () => {
		;(tokenService.verifyToken as any).mockImplementation(() => {
			throw new Error('Invalid token')
		})
		const res = await request(app.app).get('/verify-email?token=bad-token')
		expect(res.status).toBe(401)
	})
})

describe('POST /resend-verification-email', () => {
	it('returns 200 with message regardless of user existence', async () => {
		const res = await request(app.app)
			.post('/resend-verification-email')
			.send({ email: 'nonexistent@bar.com' })
		expect(res.status).toBe(200)
		expect(res.body.message).toBeDefined()
	})

	it('returns 400 on invalid email format', async () => {
		const res = await request(app.app)
			.post('/resend-verification-email')
			.send({ email: 'not-an-email' })
		expect(res.status).toBe(400)
	})
})
