import z from 'zod'

export const SignupSchema = z.object({
	name: z.string(),
	email: z.email(),
	password: z.string(),
	birthDate: z.coerce.date(),
})

export const UserUpdateSchema = SignupSchema.partial().refine(
	(data) => Object.values(data).some((value) => value !== undefined),
	{ message: 'At least one field must be provided for update' },
)
