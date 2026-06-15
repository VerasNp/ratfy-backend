import { it, expect, describe, beforeAll, vi } from 'vitest'
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
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { DocsPort } from '#application/ports/DocsPort.js'

let app: ExpressAdapter

beforeAll(() => {
	const userRepository = new UserRepositoryMemory()
	const mailService = {
		sendMail: vi.fn().mockResolvedValue(undefined),
	} as unknown as MailPort
	const templateRendererService = {
		render: vi.fn(),
	} as unknown as TemplateRendererPort
	const tokenService = {
		generateToken: vi.fn().mockReturnValue('fake-token'),
		verifyToken: vi.fn().mockReturnValue({ userId: '123', email: 'foo@bar.com' }),
	} as unknown as TokenPort
	const loggerService = {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	} as unknown as LoggerPort
	const signupUseCase = new Signup(
		userRepository,
		mailService,
		templateRendererService,
		tokenService,
		'http://localhost:3000',
		loggerService,
	)
	const docsService = {
		generate: vi.fn().mockReturnValue({}),
	} as unknown as DocsPort
	app = new ExpressAdapter(3333, docsService)
	new UserController(signupUseCase, app)
})

describe('POST /signup', () => {
	it('returns 200 with user id on success', async () => {
		const res = await request(app.app).post('/signup').send({
			name: 'Foo',
			email: 'foo@bar.com',
			password: 'Valid@123',
			birthDate: '2000-01-01',
		})
		expect(res.status).toBe(200)
	})

	it('returns 409 if email already exists', async () => {
		await request(app.app).post('/signup').send({
			name: 'Foo',
			email: 'duplicate@bar.com',
			password: 'Valid@123',
			birthDate: '2000-01-01',
		})
		const res = await request(app.app).post('/signup').send({
			name: 'Foo',
			email: 'duplicate@bar.com',
			password: 'Valid@123',
			birthDate: '2000-01-01',
		})
		expect(res.status).toBe(409)
		expect(res.body.message).toBeDefined()
	})

	it('returns 400 on invalid input', async () => {
		const res = await request(app.app).post('/signup').send({
			name: 'Foo',
			email: 'not-an-email',
			password: 'Valid@123',
			birthDate: '2000-01-01',
		})
		expect(res.status).toBe(400)
		expect(res.body.message).toBe('Validation error')
	})
})
