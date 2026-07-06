// import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

// import { z } from 'zod'

// import { AlbumGetSchema } from '#application/DTOs/album/AlbumGetInputDTO.js'
// import { TrackCreateSchema } from '#application/DTOs/track/TrackCreateInputDTO.js'
// import { TrackDeleteSchema } from '#application/DTOs/track/TrackDeleteInputDTO.js'
// import { TrackGetSchema } from '#infra/http/schemas/TracksSchemas.js'
// import { TrackListSchema } from '#application/DTOs/track/TrackListInputDTO.js'
// import { TrackUpdateSchema } from '#application/DTOs/track/TrackUpdateInputDTO.js'

// class TrackControllerSwagger {
// 	public constructor(private readonly registry: OpenAPIRegistry) {
// 		const TrackCreateBody = this.registry.register('TrackCreateBody', TrackCreateSchema)
// 		const TrackUpdateBody = this.registry.register('TrackUpdateBody', TrackUpdateSchema)
// 		this.registry.registerPath({
// 	      method:  'post',
// 	      path:    '/tracks',
// 	      request: {
// 	        body: {
// 	          content: {
// 	            'application/json': { schema: TrackCreateBody },
// 	          },
// 	          required: true,
// 	        },
// 	      },
// 	      responses: {
// 	        201: {
// 	          content: {
// 	            'application/json': {
// 	              schema: z.object({ id: z.string().uuid() }),
// 	            },
// 	          },
// 	          description: 'Track created successfully.',
// 	        },
// 	        422: { description: 'Validation error.' },
// 	      },
// 	      summary: 'Create a new track',
// 	      tags:    ['Tracks'],
// 		})
// 		this.registry.registerPath({
// 	      method:  'delete',
// 	      path:    '/tracks/{id}',
// 	      request: {
// 	        params: TrackDeleteSchema,
// 	      },
// 	      responses: {
// 	        204: { description: 'Track deleted successfully. No response body.' },
// 	        404: { description: 'Track not found.' },
// 	      },
// 	      summary: 'Soft-delete a track',
// 	      tags:    ['Tracks'],
// 		})
// 		this.registry.registerPath({
// 	      method:  'get',
// 	      path:    '/tracks/{id}',
// 	      request: {
// 	        params: TrackGetSchema,
// 	      },
// 	      responses: {
// 	        200: {
// 	          content: {
// 	            'application/json': {
// 	              schema: z.object({
// 	                albumId:     z.string().uuid(),
// 	                artistIds:   z.array(z.string().uuid()),
// 	                createdAt:   z.string().datetime(),
// 	                discNumber:  z.number().int().openapi({ example: 1 }),
// 	                durationMs:  z.number().int().openapi({ example: 214293 }),
// 	                explicit:    z.boolean(),
// 	                externalIds: z.object({
// 	                  ean:  z.string().optional(),
// 	                  isrc: z.string().optional().openapi({ example: 'USUM71703861' }),
// 	                  upc:  z.string().optional(),
// 	                }),
// 	                id:          z.string().uuid(),
// 	                isDeleted:   z.boolean(),
// 	                isLocal:     z.boolean(),
// 	                isPublic:    z.boolean(),
// 	                name:        z.string().openapi({ example: 'Billie Jean' }),
// 	                popularity:  z.number().int().openapi({ example: 88 }),
// 	                trackNumber: z.number().int().openapi({ example: 3 }),
// 	                updatedAt:   z.string().datetime(),
// 	              }),
// 	            },
// 	          },
// 	          description: 'The track.',
// 	        },
// 	        404: { description: 'Track not found.' },
// 	      },
// 	      summary: 'Get a track by ID',
// 	      tags:    ['Tracks'],
// 		})
// 		this.registry.registerPath({
// 	      description: 'Returns tracks ordered by disc number then track number — the natural playback order.',
// 	      method:      'get',
// 	      path:        '/albums/{id}/tracks',
// 	      request: {
// 	        params: AlbumGetSchema,
// 	      },
// 	      responses: {
// 	        200: {
// 	          content: {
// 	            'application/json': {
// 	              schema: z.array(
// 	                z.object({
// 	                  albumId:     z.string().uuid(),
// 	                  artistIds:   z.array(z.string().uuid()),
// 	                  discNumber:  z.number().int().openapi({ example: 1 }),
// 	                  durationMs:  z.number().int().openapi({ example: 214293 }),
// 	                  explicit:    z.boolean(),
// 	                  id:          z.string().uuid(),
// 	                  isLocal:     z.boolean(),
// 	                  name:        z.string().openapi({ example: 'Billie Jean' }),
// 	                  popularity:  z.number().int().openapi({ example: 88 }),
// 	                  trackNumber: z.number().int().openapi({ example: 3 }),
// 	                })
// 	              ),
// 	            },
// 	          },
// 	          description: 'Ordered list of tracks for the album.',
// 	        },
// 	        404: { description: 'Album not found.' },
// 	      },
// 	      summary:     'List tracks for an album',
// 	      tags:        ['Albums', 'Tracks'],
// 	    })
// 		this.registry.registerPath({
// 	      method:  'get',
// 	      path:    '/tracks',
// 	      request: {
// 	        query: TrackListSchema,
// 	      },
// 	      responses: {
// 	        200: {
// 	          content: {
// 	            'application/json': {
// 	              schema: z.array(
// 	                z.object({
// 	                  albumId:     z.string().uuid(),
// 	                  artistIds:   z.array(z.string().uuid()),
// 	                  discNumber:  z.number().int().openapi({ example: 1 }),
// 	                  durationMs:  z.number().int().openapi({ example: 214293 }),
// 	                  explicit:    z.boolean(),
// 	                  id:          z.string().uuid(),
// 	                  isLocal:     z.boolean(),
// 	                  name:        z.string().openapi({ example: 'Billie Jean' }),
// 	                  popularity:  z.number().int().openapi({ example: 88 }),
// 	                  trackNumber: z.number().int().openapi({ example: 3 }),
// 	                })
// 	              ),
// 	            },
// 	          },
// 	          description: 'Paginated list of tracks.',
// 	        },
// 	      },
// 	      summary: 'List tracks (paginated)',
// 	      tags:    ['Tracks'],
// 		})
// 		this.registry.registerPath({
// 	      method:  'patch',
// 	      path:    '/tracks/{id}',
// 	      request: {
// 	        body: {
// 	          content: {
// 	            'application/json': { schema: TrackUpdateBody },
// 	          },
// 	          required: true,
// 	        },
// 	        params: TrackGetSchema,
// 	      },
// 	      responses: {
// 	        204: { description: 'Track updated successfully. No response body.' },
// 	        404: { description: 'Track not found.' },
// 	        422: { description: 'Validation error.' },
// 	      },
// 	      summary: 'Partially update a track',
// 	      tags:    ['Tracks'],
// 	    })
// 	}
// }
// export default TrackControllerSwagger
