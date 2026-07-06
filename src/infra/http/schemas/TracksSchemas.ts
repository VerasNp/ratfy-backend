import { z } from 'zod'

export const TrackGetSchema = z.object({
	id: z.string().uuid(),
})

const ExternalIdsSchema = z.object({
	ean: z.string().optional(),
	isrc: z.string().optional(),
	upc: z.string().optional(),
})

export const TrackCreateSchema = z.object({
	title: z.string().min(1).max(500),
	durationMs: z.number().int().min(0),
	discNumber: z.number().int().min(1).default(1),
	trackNumber: z.number().int().min(1),
	explicit: z.boolean(),
	albumId: z.string(),
	artistIds: z.array(z.string()).min(1, 'At least one artist is required'),
	externalIds: ExternalIdsSchema.default({}),
	isPublic: z.boolean().default(true),
	lyrics: z.string().optional(),
})

export const TrackUpdateSchema = TrackCreateSchema.partial().refine(
	(data) => Object.keys(data).length > 1,
	{
		message: 'At least one field must be provided for update',
	},
)

export const TrackListSchema = z.object({
	albumId: z.string().uuid().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	page: z.coerce.number().int().min(1).default(1),
})

export const TrackSearchSchema = z.object({
	query: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	page: z.coerce.number().int().min(1).default(1),
})
