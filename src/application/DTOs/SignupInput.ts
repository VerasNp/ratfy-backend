import { z } from 'zod'

export const SignupSchema = z.object({
	name: z.string().min(3),
	email: z.email(),
	password: z.string(),
	birthDate: z.coerce.date(),
})

export type SignupInput = z.infer<typeof SignupSchema>
