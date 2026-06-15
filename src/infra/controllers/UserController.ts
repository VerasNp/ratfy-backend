import { SignupSchema } from '#application/DTOs/SignupInputDTO.js'
import type GetAccountUseCase from '#application/useCases/GetAccountUseCase.js'
import type SignupUseCase from '#application/useCases/SignupUseCase.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'

class UserController {
	public constructor(
		private readonly signUpUserCase: SignupUseCase,
		private readonly httpServer: HttpServerPort,
		private readonly getAccountUseCase: GetAccountUseCase,
		private readonly authMiddleware: AuthMiddleware,
	) {
		this.httpServer.register(
			'post',
			'/signup',
			async (_params: any, body: any, _query: any) => {
				const input = SignupSchema.parse(body)
				await this.signUpUserCase.execute(input)
				return { message: 'User created successfully' }
			},
		)

		this.httpServer.register(
			'get',
			'/account',
			async (_params: any, _body: any, _query: any, req: any) => {
				const { userId } = req.user
				const output = await this.getAccountUseCase.execute(userId)
				return { body: output }
			},
			[this.authMiddleware.handle()],
		)
	}
}

export default UserController
