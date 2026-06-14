import { ResendVerificationEmailSchema } from '#application/DTOs/ResendVerificationEmailInputDTO.js'
import { VerifyEmailSchema } from '#application/DTOs/VerifyEmailInputDTO.js'
import type ResendVerificationEmail from '#application/useCases/ResendVerificationEmail.js'
import type VerifyUserMail from '#application/useCases/VerifyUserMail.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

class VerifyEmailController {
	public constructor(
		private httpServer: HttpServerPort,
		private verifyUserMailUserCase: VerifyUserMail,
		private resendVerificationEmailUserCase: ResendVerificationEmail,
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
		)
	}
}

export default VerifyEmailController
