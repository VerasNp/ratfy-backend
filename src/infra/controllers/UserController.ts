import { SignupSchema } from '#application/DTOs/SignupInputDTO.js'
import type Signup from '#application/useCases/Signup.js'
import type { HttpServerPort } from '#infra/http/HttpServerPort.js'

class UserController {
	public constructor(
		private signUpUserCase: Signup,
		private httpServer: HttpServerPort,
	) {
		this.httpServer.register('post', '/signup', async (_params: any, body: any, _query: any) => {
			const input = SignupSchema.parse(body)
			await this.signUpUserCase.execute(input)
			return { message: 'User created successfully' }
		})
	}
}

export default UserController
