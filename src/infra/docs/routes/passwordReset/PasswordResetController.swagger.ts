import { ForgotPasswordSchema } from '#application/DTOs/ForgotPasswordInputDTO.js'
import { ResetPasswordSchema } from '#application/DTOs/ResetPasswordInputDTO.js'
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

class PasswordResetControllerSwagger {
	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
		const ForgotPasswordBody = this.openApiRegistry.register(
			'ForgotPasswordBody',
			ForgotPasswordSchema,
		)

		const ResetPasswordBody = this.openApiRegistry.register(
			'ResetPasswordBody',
			ResetPasswordSchema,
		)

		const MessageResponse = this.openApiRegistry.register(
			'PasswordResetMessageResponse',
			z.object({
				message: z.string(),
			}),
		)

		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/forgot-password',
			tags: ['Password Reset'],
			summary: 'Request password reset',
			description:
				'Sends a password reset email if the account exists. Always returns the same response to avoid email enumeration.',
			request: {
				body: {
					content: {
						'application/json': {
							schema: ForgotPasswordBody,
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Request processed successfully',
					content: {
						'application/json': {
							schema: MessageResponse,
						},
					},
				},
				400: {
					description: 'Validation error',
				},
			},
		})

		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/reset-password',
			tags: ['Password Reset'],
			summary: 'Reset password with token',
			description:
				'Resets the user password using the token received via email.',
			request: {
				body: {
					content: {
						'application/json': {
							schema: ResetPasswordBody,
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Password reset successfully',
					content: {
						'application/json': {
							schema: MessageResponse,
						},
					},
				},
				400: {
					description: 'Invalid or expired token, or validation error',
				},
			},
		})
	}
}

export default PasswordResetControllerSwagger
