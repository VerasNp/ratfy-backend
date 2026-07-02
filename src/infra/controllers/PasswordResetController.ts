import { ForgotPasswordSchema } from '#application/DTOs/ForgotPasswordInputDTO.js'
import { ResetPasswordSchema } from '#application/DTOs/ResetPasswordInputDTO.js'
import type ForgotPasswordUseCase from '#application/useCases/auth/ForgotPasswordUseCase.js'
import type ResetPasswordUseCase from '#application/useCases/auth/ResetPasswordUseCase.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

class PasswordResetController {
	public constructor(
		private httpServer: HttpServerPort,
		private forgotPasswordUseCase: ForgotPasswordUseCase,
		private resetPasswordUseCase: ResetPasswordUseCase,
	) {
		this.httpServer.register(
			'post',
			'/forgot-password',
			async (_params: any, body: any, _query: any) => {
				const input = ForgotPasswordSchema.parse(body)
				await this.forgotPasswordUseCase.execute(input)
				return {
					message:
						'If an account with that email exists, a password reset link has been sent.',
				}
			},
		)

		this.httpServer.register(
			'post',
			'/reset-password',
			async (_params: any, body: any, _query: any) => {
				const input = ResetPasswordSchema.parse(body)
				await this.resetPasswordUseCase.execute(input)
				return { message: 'Password has been reset successfully.' }
			},
		)
	}
}

export default PasswordResetController
