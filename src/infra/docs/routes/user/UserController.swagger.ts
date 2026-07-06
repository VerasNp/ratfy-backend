// import { SignupSchema } from '#application/DTOs/SignupInputDTO.js'
// import { UserUpdateSchema } from '#application/DTOs/user/UserUpdateInputDTO.js'
// import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
// import z from 'zod'

// class UserControllerSwagger {
// 	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
// 		const SignupBody = this.openApiRegistry.register('SignupBody', SignupSchema)

// 		const SuccessMessage = this.openApiRegistry.register(
// 			'SuccessMessage',
// 			z.object({
// 				message: z.string(),
// 			}),
// 		)

// 		const AccountResponse = this.openApiRegistry.register(
// 			'AccountResponse',
// 			z.object({
// 				id: z.string(),
// 				name: z.string(),
// 				email: z.string().email(),
// 			}),
// 		)

// 		const UserParams = this.openApiRegistry.register(
// 			'UserParams',
// 			z.object({
// 				id: z.string(),
// 			}),
// 		)

// 		const UserResponse = this.openApiRegistry.register(
// 			'UserResponse',
// 			z.object({
// 				id: z.string(),
// 				name: z.string(),
// 				email: z.string().email(),
// 			}),
// 		)

// 		const UserUpdateBody = this.openApiRegistry.register(
// 			'UserUpdateBody',
// 			UserUpdateSchema,
// 		)

// 		this.openApiRegistry.registerPath({
// 			method: 'post',
// 			path: '/signup',
// 			tags: ['Users'],
// 			summary: 'Create a new account',
// 			request: {
// 				body: {
// 					content: {
// 						'application/json': {
// 							schema: SignupBody,
// 						},
// 					},
// 				},
// 			},
// 			responses: {
// 				201: {
// 					description: 'User created successfully',
// 					content: {
// 						'application/json': {
// 							schema: SuccessMessage,
// 						},
// 					},
// 				},
// 				400: {
// 					description: 'Validation error',
// 				},
// 				409: {
// 					description: 'Email already in use',
// 				},
// 			},
// 		})

// 		this.openApiRegistry.registerPath({
// 			method: 'get',
// 			path: '/account',
// 			tags: ['Users'],
// 			summary: 'Get authenticated user account',
// 			description: 'Returns information about the currently authenticated user.',
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 			responses: {
// 				200: {
// 					description: 'Account retrieved successfully',
// 					content: {
// 						'application/json': {
// 							schema: AccountResponse,
// 						},
// 					},
// 				},
// 				401: {
// 					description: 'Unauthorized',
// 				},
// 				404: {
// 					description: 'User not found',
// 				},
// 			},
// 		})
// 		this.openApiRegistry.registerPath({
// 			method: 'get',
// 			path: '/user/{id}',
// 			tags: ['Users'],
// 			summary: 'Get user by id',
// 			description: 'Returns information about a specific user.',
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 			request: {
// 				params: UserParams,
// 			},
// 			responses: {
// 				200: {
// 					description: 'User found',
// 					content: {
// 						'application/json': {
// 							schema: UserResponse,
// 						},
// 					},
// 				},
// 				401: {
// 					description: 'Unauthorized',
// 				},
// 				404: {
// 					description: 'User not found',
// 				},
// 			},
// 		})
// 		this.openApiRegistry.registerPath({
// 			method: 'get',
// 			path: '/users',
// 			tags: ['Users'],
// 			summary: 'List users',
// 			description: 'Returns all users.',
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 			responses: {
// 				200: {
// 					description: 'Users retrieved successfully',
// 					content: {
// 						'application/json': {
// 							schema: z.array(UserResponse),
// 						},
// 					},
// 				},
// 				401: {
// 					description: 'Unauthorized',
// 				},
// 			},
// 		})

// 		this.openApiRegistry.registerPath({
// 			method: 'patch',
// 			path: '/user/{id}',
// 			tags: ['Users'],
// 			summary: 'Update user',
// 			description: 'Updates the authenticated user profile.',
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 			request: {
// 				params: UserParams,
// 				body: {
// 					content: {
// 						'application/json': {
// 							schema: UserUpdateBody,
// 						},
// 					},
// 				},
// 			},
// 			responses: {
// 				200: {
// 					description: 'User updated successfully',
// 					content: {
// 						'application/json': {
// 							schema: z.object({
// 								id: z.string(),
// 								name: z.string(),
// 								email: z.string().email(),
// 								birthDate: z.string(),
// 							}),
// 						},
// 					},
// 				},
// 				400: {
// 					description: 'Validation error',
// 				},
// 				401: {
// 					description: 'Unauthorized',
// 				},
// 				403: {
// 					description: 'Forbidden - you can only update your own account',
// 				},
// 				404: {
// 					description: 'User not found',
// 				},
// 				409: {
// 					description: 'Email already in use',
// 				},
// 			},
// 		})
// 	}
// }

// export default UserControllerSwagger
