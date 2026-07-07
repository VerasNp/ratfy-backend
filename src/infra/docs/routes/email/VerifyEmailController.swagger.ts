import { ResendVerificationEmailSchema } from '#application/DTOs/ResendVerificationEmailInputDTO.js'
import { VerifyEmailSchema } from '#application/DTOs/VerifyEmailInputDTO.js'
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

class VerifyEmailControllerSwagger {
	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
		const VerifyEmailQuery = this.openApiRegistry.register(
			'VerifyEmailQuery',
			VerifyEmailSchema,
		)

		const ResendVerificationEmailBody = this.openApiRegistry.register(
			'ResendVerificationEmailBody',
			ResendVerificationEmailSchema,
		)

		const MessageResponse = this.openApiRegistry.register(
			'MessageResponse',
			z.object({
				message: z.string(),
			}),
		)

		this.openApiRegistry.registerPath({
			method: 'get',
			path: '/verify-email',
			tags: ['Email Verification'],
			summary: 'Verify user email',
			description: 'Verifies a user email using the verification token.',
			request: {
				query: VerifyEmailQuery,
			},
			responses: {
				200: {
					description: 'Email verified successfully',
					content: {
						'application/json': {
							schema: MessageResponse,
						},
					},
				},
				400: {
					description: 'Invalid or expired verification token',
				},
				404: {
					description: 'Verification token not found',
				},
			},
		})

		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/resend-verification-email',
			tags: ['Email Verification'],
			summary: 'Resend verification email',
			description:
				'Sends a new verification email if the account exists and is not yet verified.',
			request: {
				body: {
					content: {
						'application/json': {
							schema: ResendVerificationEmailBody,
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
	}
}

export default VerifyEmailControllerSwagger
