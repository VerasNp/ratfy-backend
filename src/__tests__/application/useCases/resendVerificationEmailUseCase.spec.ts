import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import ResendVerificationEmailUseCase from '#application/useCases/ResendVerificationEmailUseCase.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { templateRendererPortMock } from '#application/ports/__mocks__/TemplateRendererPortMock.js'
import { mailPortMock } from '#application/ports/__mocks__/MailPortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'

let userRepository: UserRepositoryMemory
let resendVerificationEmail: ResendVerificationEmailUseCase
beforeEach(() => {
	userRepository = new UserRepositoryMemory()
	resendVerificationEmail = new ResendVerificationEmailUseCase(
		userRepository,
		tokenPortMock,
		templateRendererPortMock,
		mailPortMock,
		null as unknown as string,
		loggerPortMock,
	)
	vi.clearAllMocks()
})

describe('ResendVerificationEmail use case', () => {
	it('should resend verification email successfully', async () => {
		const user = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
		await userRepository.create(user)
		await resendVerificationEmail.execute({ email: 'foo@bar.com' })
		expect(mailPortMock.sendMail).toHaveBeenCalledOnce()
	})
	it('should not resend verification email if user is already verified', async () => {
		const user = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
		user.verifyEmail()
		await userRepository.create(user)
		await resendVerificationEmail.execute({ email: 'foo@bar.com' })
		expect(mailPortMock.sendMail).not.toHaveBeenCalled()
	})
	it('should not resend verification email if user does not exist', async () => {
		await resendVerificationEmail.execute({ email: 'nonexistent@bar.com' })
		expect(mailPortMock.sendMail).not.toHaveBeenCalled()
	})
})
