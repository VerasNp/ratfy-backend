import { ResendVerificationEmailSchema } from '#application/DTOs/ResendVerificationEmailInputDTO.js'
import { VerifyEmailSchema } from '#application/DTOs/VerifyEmailInputDTO.js'
import type ResendVerificationEmailUseCase from '#application/useCases/auth/ResendVerificationEmailUseCase.js'
import type VerifyUserMailUseCase from '#application/useCases/mail/VerifyUserMailUseCase.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type RateLimitMiddleware from '#infra/http/middlewares/RateLimitMiddleware.js'

class VerifyEmailController {
	public constructor(
		private httpServer: HttpServerPort,
		private verifyUserMailUserCase: VerifyUserMailUseCase,
		private resendVerificationEmailUserCase: ResendVerificationEmailUseCase,
		private resendVerificationRateLimiter: RateLimitMiddleware,
	) {
		this.httpServer.register(
			'get',
			'/verify-email',
			async (_params: any, _body: any, query: any) => {
				const input = VerifyEmailSchema.parse({ token: query.token })
				await this.verifyUserMailUserCase.execute(input)
				return { message: 'Email verified successfully' }
			},
		)

		this.httpServer.register(
			'post',
			'/resend-verification-email',
			async (_params: any, body: any, _query: any) => {
				const input = ResendVerificationEmailSchema.parse(body)
				await this.resendVerificationEmailUserCase.execute(input)
				return { message: 'If an account exists, a verification email will be sent.' }
			},
			[this.resendVerificationRateLimiter.handle()],
		)
	}
}

export default VerifyEmailController
