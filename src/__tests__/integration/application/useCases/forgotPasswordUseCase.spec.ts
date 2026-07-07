import { tokenPortMock } from '#application/ports/__mocks__/TokenPortMock.js'
import ForgotPasswordUseCase from '#application/useCases/auth/ForgotPasswordUseCase.js'
import User from '#domain/user/User.js'
import UserRepositoryMemory from '#infra/repository/UserRepositoryMemory.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { templateRendererPortMock } from '#application/ports/__mocks__/TemplateRendererPortMock.js'
import { mailPortMock } from '#application/ports/__mocks__/MailPortMock.js'
import { loggerPortMock } from '#application/ports/__mocks__/LoggerPort.js'

let userRepository: UserRepositoryMemory
let forgotPasswordUseCase: ForgotPasswordUseCase
beforeEach(() => {
	userRepository = new UserRepositoryMemory()
	forgotPasswordUseCase = new ForgotPasswordUseCase(
		userRepository,
		tokenPortMock,
		templateRendererPortMock,
		mailPortMock,
		null as unknown as string,
		loggerPortMock,
	)
	vi.clearAllMocks()
})

describe('ForgotPassword use case', () => {
	it('should send password reset email successfully', async () => {
		const user = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
		await userRepository.create(user)
		await forgotPasswordUseCase.execute({ email: 'foo@bar.com' })
		expect(mailPortMock.sendMail).toHaveBeenCalledOnce()
	})
	it('should not send email if user does not exist', async () => {
		await forgotPasswordUseCase.execute({ email: 'nonexistent@bar.com' })
		expect(mailPortMock.sendMail).not.toHaveBeenCalled()
	})
	it('should generate a token with 1 hour expiry', async () => {
		const user = User.create('Foo', 'foo@bar.com', 'Valid@123', new Date('2000-01-01'))
		await userRepository.create(user)
		await forgotPasswordUseCase.execute({ email: 'foo@bar.com' })
		expect(tokenPortMock.generateToken).toHaveBeenCalledWith(
			{ userId: user.id, email: user.email.value },
			3600,
		)
	})
})
