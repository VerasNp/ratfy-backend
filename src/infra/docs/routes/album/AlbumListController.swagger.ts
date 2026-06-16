import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import z from 'zod'

import { AlbumListSchema } from '#application/DTOs/album/AlbumListInputDTO.js'

class AlbumListControllerSwagger {
  public constructor(private readonly registry: OpenAPIRegistry) {
    this.registry.registerPath({
      method:  'get',
      path:    '/albums',
      request: {
        query: AlbumListSchema,
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.array(
                z.object({
                  albumType:        z.enum(['album', 'single']),
                  artistIds:        z.array(z.string().uuid()),
                  id:               z.string().uuid(),
                  label:            z.string(),
                  name:             z.string().openapi({ example: 'Thriller' }),
                  releaseDate:      z.string().openapi({ example: '1982-11-30' }),
                  releasePrecision: z.enum(['day', 'month', 'year']),
                  totalTracks:      z.number().int(),
                })
              ),
            },
          },
          description: 'Paginated list of albums.',
        },
      },
      summary: 'List albums (paginated)',
      tags:    ['Albums'],
    })
  }
}

export default AlbumListControllerSwagger
