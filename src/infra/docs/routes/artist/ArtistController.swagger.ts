import { BecomeArtistSchema } from '#application/DTOs/artist/BecomeArtistInputDTO.js'
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

class ArtistControllerSwagger {
	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
		const BecomeArtistBody = this.openApiRegistry.register(
			'BecomeArtistBody',
			BecomeArtistSchema,
		)

		const BecomeArtistResponse = this.openApiRegistry.register(
			'BecomeArtistResponse',
			z.object({
				body: z.object({
					id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
					userId: z.string().uuid().openapi({ example: '660e8400-e29b-41d4-a716-446655440001' }),
					bio: z
						.string()
						.nullable()
						.openapi({ example: 'Guitarist and composer from Brazil' }),
					createdAt: z
						.string()
						.datetime()
						.openapi({ example: '2024-01-15T10:30:00.000Z' }),
					updatedAt: z
						.string()
						.datetime()
						.openapi({ example: '2024-01-15T10:30:00.000Z' }),
				}),
			}),
		)

		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/become-artist',
			tags: ['Artists'],
			summary: 'Become an artist',
			description:
				'Creates an artist profile for the authenticated user and assigns the ARTIST role. The user retains their existing USER role.',
			security: [
				{
					bearerAuth: [],
				},
			],
			request: {
				body: {
					content: {
						'application/json': {
							schema: BecomeArtistBody,
						},
					},
				},
			},
			responses: {
				200: {
					description: 'Artist profile created successfully',
					content: {
						'application/json': {
							schema: BecomeArtistResponse,
						},
					},
				},
				400: {
					description: 'Validation error — bio exceeds 2000 characters',
				},
				401: {
					description: 'Unauthorized — missing or invalid token',
				},
				409: {
					description: 'Conflict — user already has an artist profile',
				},
				500: {
					description: 'Internal server error — ARTIST role not seeded in the system',
				},
			},
		})
	}
}

export default ArtistControllerSwagger
