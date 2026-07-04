import z from 'zod'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export const ResetPasswordSchema = z.object({
	token: z.string(),
	newPassword: z.string().regex(
		passwordRegex,
		'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
	),
})

export type ResetPasswordInputDTO = z.infer<typeof ResetPasswordSchema>
