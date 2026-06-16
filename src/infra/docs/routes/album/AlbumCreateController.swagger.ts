import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import z from 'zod'

import { AlbumCreateSchema } from '#application/DTOs/album/AlbumCreateInputDTO.js'


class AlbumCreateControllerSwagger {
	public constructor(private readonly openApiRegistry: OpenAPIRegistry) {
		const AlbumCreateBody = this.openApiRegistry.register('AlbumCreateBody', AlbumCreateSchema)
		this.openApiRegistry.registerPath({
			method: 'post',
			path: '/album',
			request: {
				body: {
					content: {
						'application/json' : { schema: AlbumCreateBody }
					},
				}
			},
			responses: {
				201: {
					content: {
						'application/json': {
							schema: z.object({ id: z.string() }),
						},
					},
					description: 'Sucessfully soft-deleted album',
				},
				422: {
					description: 'Validation Error',
				},
			},
			summary: 'Create a new album',
			tags: ['Album'],
		})
	}
}
export default AlbumCreateControllerSwagger
