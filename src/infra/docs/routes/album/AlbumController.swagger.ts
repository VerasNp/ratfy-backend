// import { AlbumCreateSchema } from '#application/DTOs/album/AlbumCreateInputDTO.js'
// import { AlbumDeleteSchema } from '#application/DTOs/album/AlbumDeleteInputDTO.js'
// import { AlbumGetSchema } from '#application/DTOs/album/AlbumGetInputDTO.js'
// import { AlbumListSchema } from '#application/DTOs/album/AlbumListInputDTO.js'
// import { AlbumUpdateSchema } from '#application/DTOs/album/AlbumUpdateInputDTO.js'
// import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
// import z from 'zod'

// class AlbumControllerSwagger {
// 	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
// 		const AlbumCreateBody = this.openApiRegistry.register('AlbumCreateBody', AlbumCreateSchema)
// 		const AlbumGetBody = this.openApiRegistry.register('AlbumGetBody', AlbumCreateSchema)
// 		const AlbumUpdateBody = this.openApiRegistry.register('AlbumUpdateBody', AlbumUpdateSchema)

// 		this.openApiRegistry.registerPath({
// 			method: 'post',
// 			path: '/album',
// 			request: {
// 				body: {
// 					content: {
// 						'application/json': { schema: AlbumCreateBody },
// 					},
// 				},
// 			},
// 			responses: {
// 				201: {
// 					content: {
// 						'application/json': {
// 							schema: z.object({ id: z.string() }),
// 						},
// 					},
// 					description: 'Sucessfully soft-deleted album',
// 				},
// 				422: {
// 					description: 'Validation Error',
// 				},
// 			},
// 			summary: 'Create a new album',
// 			tags: ['Albums'],
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 		})

// 		this.openApiRegistry.registerPath({
// 			method: 'delete',
// 			path: '/albums/{id}',
// 			request: {
// 				params: AlbumDeleteSchema,
// 			},
// 			responses: {
// 				204: { description: 'Album deleted successfully. No response body.' },
// 				404: { description: 'Album not found.' },
// 			},
// 			summary: 'Soft-delete an album',
// 			tags: ['Albums'],
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 		})

// 		this.openApiRegistry.registerPath({
// 			method: 'get',
// 			path: '/albums/{id}',
// 			request: {
// 				body: {
// 					content: {
// 						'application/json': { schema: AlbumGetBody },
// 					},
// 				},
// 			},
// 			responses: {
// 				200: {
// 					content: {
// 						'application/json': {
// 							schema: z.object({
// 								albumType: z.enum(['album', 'single']),
// 								artistIds: z.array(z.string().uuid()),
// 								createdAt: z.string().datetime(),
// 								id: z.string().uuid(),
// 								isDeleted: z.boolean(),
// 								isPublic: z.boolean(),
// 								label: z.string().openapi({ example: 'Epic Records' }),
// 								name: z.string().openapi({ example: 'Thriller' }),
// 								releaseDate: z.string().openapi({ example: '1982-11-30' }),
// 								releasePrecision: z.enum(['day', 'month', 'year']),
// 								totalTracks: z.number().int().openapi({ example: 9 }),
// 								updatedAt: z.string().datetime(),
// 							}),
// 						},
// 					},
// 					description: 'The album.',
// 				},
// 				404: { description: 'Album not found.' },
// 			},
// 			summary: 'Get an album by ID',
// 			tags: ['Albums'],
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 		})

// 		this.openApiRegistry.registerPath({
// 			method: 'get',
// 			path: '/albums',
// 			request: {
// 				query: AlbumListSchema,
// 			},
// 			responses: {
// 				200: {
// 					content: {
// 						'application/json': {
// 							schema: z.array(
// 								z.object({
// 									albumType: z.enum(['album', 'single']),
// 									artistIds: z.array(z.string().uuid()),
// 									id: z.string().uuid(),
// 									label: z.string(),
// 									name: z.string().openapi({ example: 'Thriller' }),
// 									releaseDate: z.string().openapi({ example: '1982-11-30' }),
// 									releasePrecision: z.enum(['day', 'month', 'year']),
// 									totalTracks: z.number().int(),
// 								}),
// 							),
// 						},
// 					},
// 					description: 'Paginated list of albums.',
// 				},
// 			},
// 			summary: 'List albums (paginated)',
// 			tags: ['Albums'],
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 		})

// 		this.openApiRegistry.registerPath({
// 			method: 'patch',
// 			path: '/albums/{id}',
// 			request: {
// 				body: {
// 					content: {
// 						'application/json': { schema: AlbumUpdateBody },
// 					},
// 					required: true,
// 				},
// 				params: AlbumGetSchema,
// 			},
// 			responses: {
// 				204: { description: 'Album updated successfully. No response body.' },
// 				404: { description: 'Album not found.' },
// 				422: { description: 'Validation error.' },
// 			},
// 			summary: 'Partially update an album',
// 			tags: ['Albums'],
// 			security: [
// 				{
// 					bearerAuth: [],
// 				},
// 			],
// 		})
// 	}
// }

// export default AlbumControllerSwagger
