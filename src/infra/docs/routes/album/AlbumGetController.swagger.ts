import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import z from 'zod'

import { AlbumGetSchema } from '#application/DTOs/album/AlbumGetInputDTO.js'

class AlbumGetControllerSwagger {
	public constructor(private readonly registry: OpenAPIRegistry) {
	const AlbumGetBody = this.openApiRegistry.register('AlbumGetBody', AlbumCreateSchema)
    this.registry.registerPath({
      method:  'get',
      path:    '/albums/{id}',
      request: {
        body: {
			content: {
				'application/json' : { schema: AlbumGetBody }
			},
		}
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({
                albumType:        z.enum(['album', 'single']),
                artistIds:        z.array(z.string().uuid()),
                createdAt:        z.string().datetime(),
                id:               z.string().uuid(),
                isDeleted:        z.boolean(),
                isPublic:         z.boolean(),
                label:            z.string().openapi({ example: 'Epic Records' }),
                name:             z.string().openapi({ example: 'Thriller' }),
                releaseDate:      z.string().openapi({ example: '1982-11-30' }),
                releasePrecision: z.enum(['day', 'month', 'year']),
                totalTracks:      z.number().int().openapi({ example: 9 }),
                updatedAt:        z.string().datetime(),
              }),
            },
          },
          description: 'The album.',
        },
        404: { description: 'Album not found.' },
      },
      summary: 'Get an album by ID',
      tags:    ['Albums'],
    })
  }
}

export default AlbumGetControllerSwagger
