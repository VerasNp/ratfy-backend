import z from 'zod'

const RELEASE_PATTERNS: Record<string, RegExp> = {
	day: /^\d{4}-\d{2}-\d{2}$/,
	month: /^\d{4}-\d{2}$/,
	year: /^\d{4}$/,
}

const AlbumBaseSchema = z.object({
	name: z.string().min(1),
	albumType: z.string(),
	releaseDate: z.string(),
	releasePrecision: z.string(),
	totalTracks: z.number().int().nonnegative(),
	label: z.string().min(1),
	isPublic: z.boolean(),
	artistIds: z.array(z.string()).min(1),
})

export const AlbumCreateSchema = AlbumBaseSchema.superRefine(
	({ releaseDate, releasePrecision }, ctx) => {
		if (!(RELEASE_PATTERNS[releasePrecision]?.test(releaseDate) ?? false)) {
			ctx.addIssue({
				code: 'custom',
				path: ['releaseDate'],
				message:
					`releaseDate must match precision "${releasePrecision}": ` +
					`day: YYYY-MM-DD | month: YYYY-MM | year: YYYY`,
			})
		}
	},
)

export const AlbumUpdateSchema = AlbumBaseSchema.partial().refine(
	(data) => Object.keys(data).length > 0,
	{ message: 'At least one field must be provided for update' },
)

export const AlbumListSchema = z.object({
	limit: z.coerce.number().int().min(1).max(50).default(20),
	page: z.coerce.number().int().min(1).default(1),
})
