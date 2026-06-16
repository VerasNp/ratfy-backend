import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

import z from 'zod'

import { AlbumDeleteSchema } from '#application/DTOs/album/AlbumDeleteInputDTO.js'


class AlbumDeleteControllerSwagger {
	public constructor(private readonly registry: OpenAPIRegistry) {
	const AlbumDeleteBody = this.openApiRegistry.register('AlbumDeleteBody', AlbumDeleteSchema)
    this.registry.registerPath({
      method:  'delete',
      path:    '/albums/{id}',
      request: {
        params: AlbumDeleteSchema,
      },
      responses: {
        204: { description: 'Album deleted successfully. No response body.' },
        404: { description: 'Album not found.' },
      },
      summary: 'Soft-delete an album',
      tags:    ['Albums'],
    })
  }
}

export default AlbumDeleteControllerSwagger
