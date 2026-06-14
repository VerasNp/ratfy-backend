import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type { TokenPort } from '#application/ports/TokenPort.js'
import ResendVerificationEmail from '#application/useCases/ResendVerificationEmail.js'
import User from '#domain/user/User.js'
import type { MailPort } from '#infra/mail/MailPort.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import type { TemplateRendererPort } from '#infra/templateRenderer/TemplateRendererPort.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let userRepository: UserRepositoryMemory
let resendVerificationEmail: ResendVerificationEmail
let mailService: MailPort
beforeEach(() => {
	userRepository = new UserRepositoryMemory()
	mailService = {
		sendMail: vi.fn().mockResolvedValue(undefined),
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
	resendVerificationEmail = new ResendVerificationEmail(
		userRepository,
		tokenService,
		templateRendererService,
		mailService,
		appUrl,
		loggerService,
	)
})

describe('ResendVerificationEmail use case', () => {
	it('should resend verification email successfully', async () => {
		const user = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
		await userRepository.create(user)
		await resendVerificationEmail.execute({ email: 'foo@bar.com' })
		expect(mailService.sendMail).toHaveBeenCalledOnce()
	})
	it('should not resend verification email if user is already verified', async () => {
		const user = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
		user.verifyEmail()
		await userRepository.create(user)
		await resendVerificationEmail.execute({ email: 'foo@bar.com' })
		expect(mailService.sendMail).not.toHaveBeenCalled()
	})
	it('should not resend verification email if user does not exist', async () => {
		await resendVerificationEmail.execute({ email: 'nonexistent@bar.com' })
		expect(mailService.sendMail).not.toHaveBeenCalled()
	})
})
