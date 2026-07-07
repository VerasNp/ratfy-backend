import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import z from 'zod'
import { PlaylistCreateSchema, PlaylistDeleteSchema, PlaylistGetSchema, PlaylistListByOwnerIdSchema, PlaylistListSchema, PlaylistUpdateSchema } from '#infra/http/schemas/PlaylistsSchemas.js'

class PlaylistControllerSwagger {
	public constructor(private readonly registry: OpenAPIRegistry) {
		const PlaylistCreateBody = this.registry.register('PlaylistCreateBody', PlaylistCreateSchema)
		const PlaylistUpdateBody = this.registry.register('PlaylistUpdateBody', PlaylistUpdateSchema)
		
		this.registry.registerPath({
			method: 'post',
			path: '/playlists',
			request: {
				body: {
					content: {
						'application/json': { schema: PlaylistCreateBody }
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
					description: 'Successfully created playlist',
				},
				422: { description: 'Validation Error' },
			},
			summary: 'Create a new playlist',
			tags: ['Playlists'],
		})

		this.registry.registerPath({
			method: 'get',
			path: '/playlists/{id}',
			request: {
				params: PlaylistGetSchema,
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: z.object({
								id: z.string().uuid(),
								name: z.string(),
								isPublic: z.boolean(),
								ownerId: z.string().uuid(),
								createdAt: z.string().datetime(),
								updatedAt: z.string().datetime(),
							}),
						},
					},
					description: 'The playlist data.',
				},
				404: { description: 'Playlist not found.' },
			},
			summary: 'Get a playlist by ID',
			tags: ['Playlists'],
		})

		this.registry.registerPath({
			method: 'get',
			path: '/playlists',
			request: {
				query: PlaylistListSchema,
			},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									id: z.string().uuid(),
									name: z.string(),
									isPublic: z.boolean(),
									ownerId: z.string().uuid(),
								})
							),
						},
					},
					description: 'Paginated list of playlists.',
				},
			},
			summary: 'List playlists (paginated)',
			tags: ['Playlists'],
		})

		this.registry.registerPath({
			method: 'get',
			path: '/playlists/owner/{ownerId}',
			request: {
				params: PlaylistListByOwnerIdSchema.pick({ ownerId: true }),
				query: PlaylistListByOwnerIdSchema.omit({ ownerId: true }),
			},
			responses: {
				200: { description: 'Paginated list of playlists owned by the user.' },
			},
			summary: 'List playlists by owner ID',
			tags: ['Playlists'],
		})

		this.registry.registerPath({
			method: 'delete',
			path: '/playlists/{id}',
			request: {
				params: PlaylistDeleteSchema,
			},
			responses: {
				204: { description: 'Playlist deleted successfully. No response body.' },
				404: { description: 'Playlist not found.' },
			},
			summary: 'Delete a playlist',
			tags: ['Playlists'],
		})

		this.registry.registerPath({
			method: 'patch',
			path: '/playlists/{id}',
			request: {
				body: {
					content: {
						'application/json': { schema: PlaylistUpdateBody },
					},
					required: true,
				},
				params: PlaylistGetSchema,
			},
			responses: {
				204: { description: 'Playlist updated successfully. No response body.' },
				404: { description: 'Playlist not found.' },
				422: { description: 'Validation error.' },
			},
			summary: 'Partially update a playlist',
			tags: ['Playlists'],
		})

		this.registry.registerPath({
			method: 'post',
			path: '/playlists/{playlistId}/tracks',
			request: {
				params: z.object({ playlistId: z.string().uuid() }),
				body: {
					content: {
						'application/json': { 
							schema: z.object({ trackId: z.string().uuid() }) 
						},
					},
					required: true,
				},
			},
			responses: {
				201: { description: 'Track added to playlist successfully.' },
				404: { description: 'Playlist or Track not found.' },
			},
			summary: 'Add a track to a playlist',
			tags: ['Playlists'],
		})

		this.registry.registerPath({
			method: 'delete',
			path: '/playlists/{playlistId}/tracks/{trackId}',
			request: {
				params: z.object({
					playlistId: z.string().uuid(),
					trackId: z.string().uuid()
				}),
			},
			responses: {
				204: { description: 'Track removed from playlist successfully.' },
				404: { description: 'Playlist not found.' },
			},
			summary: 'Remove a track from a playlist',
			tags: ['Playlists'],
		})
	}
}

export default PlaylistControllerSwagger