import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { AddFavoriteAlbumSchema } from '#application/DTOs/favorite/AddFavoriteAlbumInputDTO.js'
import { AddFavoriteArtistSchema } from '#application/DTOs/favorite/AddFavoriteArtistInputDTO.js'
import { AddFavoritePlaylistSchema } from '#application/DTOs/favorite/AddFavoritePlaylistInputDTO.js'
import { AddFavoriteTrackSchema } from '#application/DTOs/favorite/AddFavoriteTrackInputDTO.js'

class FavoriteControllerSwagger {
	public constructor(private readonly registry: OpenAPIRegistry) {
		this.registry.registerPath({
			method: 'post',
			path: '/favorites/tracks/{trackId}',
			request: {
				params: AddFavoriteTrackSchema,
			},
			responses: {
				204: { description: 'Track favorited successfully. No response body.' },
				404: { description: 'Track not found.' },
			},
			summary: 'Favorite a track',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'delete',
			path: '/favorites/tracks/{trackId}',
			request: {
				params: AddFavoriteTrackSchema,
			},
			responses: {
				204: { description: 'Track unfavorited successfully. No response body.' },
				404: { description: 'Favorite not found.' },
			},
			summary: 'Unfavorite a track',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'get',
			path: '/favorites/tracks',
			request: {},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									albumId: z.string().uuid(),
									artistIds: z.array(z.string().uuid()),
									discNumber: z.number().int().openapi({ example: 1 }),
									durationMs: z.number().int().openapi({ example: 214293 }),
									explicit: z.boolean(),
									id: z.string().uuid(),
									isLocal: z.boolean(),
									name: z.string().openapi({ example: 'Billie Jean' }),
									popularity: z.number().int().openapi({ example: 88 }),
									trackNumber: z.number().int().openapi({ example: 3 }),
								}),
							),
						},
					},
					description: 'List of favorited tracks.',
				},
			},
			summary: 'List favorited tracks',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'post',
			path: '/favorites/artists/{artistId}',
			request: {
				params: AddFavoriteArtistSchema,
			},
			responses: {
				204: { description: 'Artist favorited successfully. No response body.' },
				404: { description: 'Artist not found.' },
			},
			summary: 'Favorite an artist',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'delete',
			path: '/favorites/artists/{artistId}',
			request: {
				params: AddFavoriteArtistSchema,
			},
			responses: {
				204: { description: 'Artist unfavorited successfully. No response body.' },
				404: { description: 'Favorite not found.' },
			},
			summary: 'Unfavorite an artist',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'get',
			path: '/favorites/artists',
			request: {},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									id: z.string().uuid(),
									userId: z.string().uuid(),
									bio: z.string().nullable(),
								}),
							),
						},
					},
					description: 'List of favorited artists.',
				},
			},
			summary: 'List favorited artists',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'post',
			path: '/favorites/playlists/{playlistId}',
			request: {
				params: AddFavoritePlaylistSchema,
			},
			responses: {
				204: { description: 'Playlist favorited successfully. No response body.' },
				404: { description: 'Playlist not found.' },
			},
			summary: 'Favorite a playlist',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'delete',
			path: '/favorites/playlists/{playlistId}',
			request: {
				params: AddFavoritePlaylistSchema,
			},
			responses: {
				204: { description: 'Playlist unfavorited successfully. No response body.' },
				404: { description: 'Favorite not found.' },
			},
			summary: 'Unfavorite a playlist',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'get',
			path: '/favorites/playlists',
			request: {},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									id: z.string().uuid(),
									name: z.string().openapi({ example: 'My Playlist' }),
									isPublic: z.boolean(),
									ownerId: z.string().uuid(),
								}),
							),
						},
					},
					description: 'List of favorited playlists.',
				},
			},
			summary: 'List favorited playlists',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'post',
			path: '/favorites/albums/{albumId}',
			request: {
				params: AddFavoriteAlbumSchema,
			},
			responses: {
				204: { description: 'Album favorited successfully. No response body.' },
				404: { description: 'Album not found.' },
			},
			summary: 'Favorite an album',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'delete',
			path: '/favorites/albums/{albumId}',
			request: {
				params: AddFavoriteAlbumSchema,
			},
			responses: {
				204: { description: 'Album unfavorited successfully. No response body.' },
				404: { description: 'Favorite not found.' },
			},
			summary: 'Unfavorite an album',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})

		this.registry.registerPath({
			method: 'get',
			path: '/favorites/albums',
			request: {},
			responses: {
				200: {
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									albumType: z.enum(['album', 'single']),
									artistIds: z.array(z.string().uuid()),
									id: z.string().uuid(),
									label: z.string(),
									name: z.string().openapi({ example: 'Thriller' }),
									releaseDate: z.string().openapi({ example: '1982-11-30' }),
									releasePrecision: z.enum(['day', 'month', 'year']),
									totalTracks: z.number().int(),
								}),
							),
						},
					},
					description: 'List of favorited albums.',
				},
			},
			summary: 'List favorited albums',
			tags: ['Favorites'],
			security: [{ bearerAuth: [] }],
		})
	}
}

export default FavoriteControllerSwagger
