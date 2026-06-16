import { LoginSchema } from '#application/DTOs/LoginInputDTO.js'
import UnauthorizedError from '#application/errors/UnauthorizedError.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import type LoginUseCase from '#application/useCases/auth/LoginUseCase.js'
import type LogoutUseCase from '#application/useCases/auth/LogoutUseCase.js'
import type RefreshTokenUseCase from '#application/useCases/auth/RefreshTokenUseCase.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'

class AuthController {
	public constructor(
		private readonly httpServer: HttpServerPort,
		private readonly loginUseCase: LoginUseCase,
		private readonly nodeEnv: string,
		private readonly authMiddleware: AuthMiddleware,
		private readonly logoutUseCase: LogoutUseCase,
		private readonly refreshTokenUseCase: RefreshTokenUseCase,
		private readonly loggerService: LoggerPort,
	) {
		this.httpServer.register('post', '/login', async (_params: any, body: any, _query: any) => {
			const input = LoginSchema.parse(body)
			const output = await this.loginUseCase.execute(input)
			const sevenDaysToExpireInMs = 7 * 24 * 60 * 60 * 1000
			return {
				body: { accessToken: output.accessToken },
				cookies: [
					{
						name: 'refreshToken',
						value: output.refreshToken,
						options: {
							httpOnly: true,
							secure: this.nodeEnv === 'production',
							sameSite: 'strict' as const,
							maxAge: sevenDaysToExpireInMs,
							path: '/',
						},
					},
				],
			}
		})

		this.httpServer.register(
			'post',
			'/refresh-token',
			async (_params: any, _body: any, _query: any, req: any) => {
				const token = req.cookies.refreshToken
				const output = await this.refreshTokenUseCase.execute(token)
				const sevenDaysToExpireInMs = 7 * 24 * 60 * 60 * 1000
				return {
					body: { accessToken: output.accessToken },
					cookies: [
						{
							name: 'refreshToken',
							value: output.refreshToken,
							options: {
								httpOnly: true,
								secure: this.nodeEnv === 'production',
								sameSite: 'strict' as const,
								maxAge: sevenDaysToExpireInMs,
								path: '/',
							},
						},
					],
				}
			},
		)

		this.httpServer.register(
			'post',
			'/logout',
			async (_params: any, _body: any, _query: any, req: any) => {
				const token = req.cookies.refreshToken
				if (!token) {
					this.loggerService.warn('AuthController: No refresh token provided')
					throw new UnauthorizedError('Invalid token')
				}
				await this.logoutUseCase.execute(token)
				return {
					body: { message: 'Logged out successfully' },
					cookies: [
						{
							name: 'refreshToken',
							value: '',
							options: {
								httpOnly: true,
								secure: this.nodeEnv === 'production',
								sameSite: 'strict' as const,
								maxAge: 0,
								path: '/',
							},
						},
					],
				}
			},
			[this.authMiddleware.handle()],
		)
	}
}

export default AuthController
