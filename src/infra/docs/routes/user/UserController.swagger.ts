import { SignupSchema } from '#application/DTOs/SignupInputDTO.js'
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

class UserControllerSwagger {
	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
		const SignupBody = this.openApiRegistry.register('SignupBody', SignupSchema)

		const SuccessMessage = this.openApiRegistry.register(
			'SuccessMessage',
			z.object({
				message: z.string(),
			}),
		)

		const AccountResponse = this.openApiRegistry.register(
			'AccountResponse',
			z.object({
				id: z.string(),
				name: z.string(),
				email: z.string().email(),
			}),
		)

		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/signup',
			tags: ['Users'],
			summary: 'Create a new account',
			request: {
				body: {
					content: {
						'application/json': {
							schema: SignupBody,
						},
					},
				},
			},
			responses: {
				201: {
					description: 'User created successfully',
					content: {
						'application/json': {
							schema: SuccessMessage,
						},
					},
				},
				400: {
					description: 'Validation error',
				},
				409: {
					description: 'Email already in use',
				},
			},
		})

		this.openApiRegistry.registerPath({
			method: 'get',
			path: '/account',
			tags: ['Users'],
			summary: 'Get authenticated user account',
			description: 'Returns information about the currently authenticated user.',
			security: [
				{
					bearerAuth: [],
				},
			],
			responses: {
				200: {
					description: 'Account retrieved successfully',
					content: {
						'application/json': {
							schema: AccountResponse,
						},
					},
				},
				401: {
					description: 'Unauthorized',
				},
				404: {
					description: 'User not found',
				},
			},
		})
	}
}

export default UserControllerSwagger
