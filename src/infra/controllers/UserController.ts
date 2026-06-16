import { SignupSchema } from '#application/DTOs/SignupInputDTO.js'
import type GetAccountUseCase from '#application/useCases/user/GetAccountUseCase.js'
import type GetUserUseCase from '#application/useCases/user/GetUserUseCase.js'
import type ListUsersUseCase from '#application/useCases/user/ListUsersUseCase.js'
import type SignupUseCase from '#application/useCases/user/SignupUseCase.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'
import type AuthMiddleware from '#infra/http/middlewares/AuthMiddleware.js'

class UserController {
	public constructor(
		private readonly signUpUserCase: SignupUseCase,
		private readonly httpServer: HttpServerPort,
		private readonly getAccountUseCase: GetAccountUseCase,
		private readonly authMiddleware: AuthMiddleware,
		private readonly getUserUseCase: GetUserUseCase,
		private readonly listUsersUseCase: ListUsersUseCase,
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

		this.httpServer.register(
			'get',
			'/user/:id',
			async (params: any, _body: any, _query: any) => {
				const { id } = params
				const output = await this.getUserUseCase.execute(id)
				return { body: output }
			},
			[this.authMiddleware.handle()],
		)

		this.httpServer.register(
			'get',
			'/users',
			async (params: any, _body: any, _query: any) => {
				const output = await this.listUsersUseCase.execute()
				return { body: output }
			},
			[this.authMiddleware.handle()],
		)
	}
}

export default UserController
