import { SignupSchema } from '#application/DTOs/SignupInput.js'
import type Signup from '#application/useCases/Signup.js'
import type { HttpServer } from '#infra/http/HttpServer.js'

class UserController {
	private signUpUserCase: Signup
	private httpServer: HttpServer
	public constructor(signUpUserCase: Signup, httpServer: HttpServer) {
		this.signUpUserCase = signUpUserCase
		this.httpServer = httpServer

		this.httpServer.register('post', '/signup', async (params: any, body: any) => {
			const input = SignupSchema.parse(body)
			const output = await this.signUpUserCase.execute(input)
			return output
		})
	}
}

export default UserController
