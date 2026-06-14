import { z } from 'zod'

export const SignupSchema = z.object({
	name: z.string(),
	email: z.email(),
	password: z.string(),
	birthDate: z.coerce.date(),
})

export type SignupInputDTO = z.infer<typeof SignupSchema>
