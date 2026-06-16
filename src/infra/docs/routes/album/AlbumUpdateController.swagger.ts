import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import z from 'zod'

import { AlbumGetSchema }    from '#application/DTOs/album/AlbumGetInputDTO.js'
import { AlbumUpdateSchema } from '#application/DTOs/album/AlbumUpdateInputDTO.js'

class AlbumUpdateControllerSwagger {
  public constructor(private readonly registry: OpenAPIRegistry) {
    const AlbumUpdateBody = this.registry.register('AlbumUpdateBody',AlbumUpdateSchema)
    this.registry.registerPath({
      method:  'patch',
      path:    '/albums/{id}',
      request: {
        body: {
          content: {
            'application/json': { schema: AlbumUpdateBody },
          },
          required: true,
        },
        params: AlbumGetSchema,
      },
      responses: {
        204: { description: 'Album updated successfully. No response body.' },
        404: { description: 'Album not found.' },
        422: { description: 'Validation error.' },
      },
      summary: 'Partially update an album',
      tags:    ['Albums'],
    })
  }
}

export default AlbumUpdateControllerSwagger
