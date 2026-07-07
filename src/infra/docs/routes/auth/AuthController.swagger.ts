import { LoginSchema } from '#application/DTOs/LoginInputDTO.js'
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

class AuthControllerSwagger {
	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
		const LoginBody = this.openApiRegistry.register('LoginBody', LoginSchema)

		const AccessTokenResponse = this.openApiRegistry.register(
			'AccessTokenResponse',
			z.object({
				accessToken: z.string(),
			}),
		)

		const MessageResponse = this.openApiRegistry.register(
			'MessageResponse',
			z.object({
				message: z.string(),
			}),
		)

		// LOGIN
		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/login',
			tags: ['Auth'],
			summary: 'Authenticate user',
			description:
				'Authenticates a user and returns an access token. A refresh token is also sent as an HttpOnly cookie.',
			request: {
				body: {
					content: {
						'application/json': {
							schema: LoginBody,
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Login successful',
					content: {
						'application/json': {
							schema: AccessTokenResponse,
						},
					},
					headers: {
						'Set-Cookie': {
							description: 'HttpOnly refresh token cookie',
							schema: {
								type: 'string',
							},
						},
					},
				},
				401: {
					description: 'Invalid credentials',
				},
				400: {
					description: 'Validation error',
				},
			},
		})

		// REFRESH TOKEN
		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/refresh-token',
			tags: ['Auth'],
			summary: 'Refresh access token',
			description:
				'Generates a new access token and refresh token using the refresh token stored in the cookie.',
			responses: {
				200: {
					description: 'Token refreshed successfully',
					content: {
						'application/json': {
							schema: AccessTokenResponse,
						},
					},
					headers: {
						'Set-Cookie': {
							description: 'New HttpOnly refresh token cookie',
							schema: {
								type: 'string',
							},
						},
					},
				},
				401: {
					description: 'Invalid or expired refresh token',
				},
			},
		})

		// LOGOUT
		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/logout',
			tags: ['Auth'],
			summary: 'Logout user',
			description:
				'Invalidates the current refresh token and clears the refresh token cookie.',
			security: [
				{
					bearerAuth: [],
				},
			],
			responses: {
				200: {
					description: 'Logout successful',
					content: {
						'application/json': {
							schema: MessageResponse,
						},
					},
					headers: {
						'Set-Cookie': {
							description: 'Clears refresh token cookie',
							schema: {
								type: 'string',
							},
						},
					},
				},
				401: {
					description: 'Unauthorized',
				},
			},
		})
	}
}

export default AuthControllerSwagger
