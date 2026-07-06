import { z } from 'zod'

export const PlaylistListSchema = z.object({
	limit: z.coerce.number().int().min(1).max(50).default(20),
	page: z.coerce.number().int().min(1).default(1),
})

export const PlaylistCreateSchema = z.object({
	name: z.string().min(1, 'Playlist name cannot be empty.').max(100, 'Name must be at most 100 characters.'),
	isPublic: z.boolean().optional().default(true),
	ownerId: z.string().uuid('Invalid Owner ID format. Must be a valid UUID.'),
})

export const PlaylistUpdateSchema = PlaylistCreateSchema.omit({ ownerId: true }).partial().refine(
	(data) => Object.keys(data).length > 0,
	{ message: 'At least one field must be provided for update' },
)

export const PlaylistGetSchema = z.object({
	id: z.string().uuid('Invalid Playlist ID format. Must be a valid UUID.'),
})

export const PlaylistListByOwnerIdSchema = PlaylistListSchema.extend({
	ownerId: z.string().uuid('Invalid Owner ID format. Must be a valid UUID.'),
})

export const PlaylistAddTrackSchema = z.object({
	playlistId: z.string().uuid('Invalid Playlist ID format.'),
	trackId: z.string().uuid('Invalid Track ID format.'),
})

export const PlaylistDeleteSchema = z.object({
	id: z.string().uuid('Invalid Playlist ID format. Must be a valid UUID.'),
})

export const PlaylistRemoveTrackSchema = z.object({
	playlistId: z.string().uuid('Invalid Playlist ID format.'),
	trackId: z.string().uuid('Invalid Track ID format.'),
})
