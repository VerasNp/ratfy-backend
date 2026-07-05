import { z } from 'zod'

export const ArtistListSchema = z.object({
	query: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	page: z.coerce.number().int().min(1).default(1),
})

export const ArtistCreateSchema = z.object({
	userId: z.string("User ID must be a string"),
	bio: z.string("Bio must be a string or null").max(2000, "Bio must contain at most 2000 character(s)").nullable(),
})

export const ArtistUpdateSchema = ArtistCreateSchema.omit({ userId: true }).refine(
	(data) => Object.keys(data).length > 0,
	{
		message: 'At least one field must be provided for update',
	},
)
