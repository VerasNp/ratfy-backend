import { SignupSchema } from '#application/DTOs/SignupInputDTO.js'
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

class AuthControllerSwagger {
	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
		const SignupBody = this.openApiRegistry.register('SignupBody', SignupSchema)
		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/signup',
			tags: ['Auth'],
			summary: 'Register a new user',
			request: {
				body: {
					content: { 'application/json': { schema: SignupBody } },
				},
			},
			responses: {
				200: {
					description: 'User created successfully',
					content: {
						'application/json': {
							schema: z.object({ id: z.string()}),
						},
					},
				},
				400: { description: 'Validation error' },
				409: { description: 'Email already in use' },
			},
		})
	}
}

export default AuthControllerSwagger
