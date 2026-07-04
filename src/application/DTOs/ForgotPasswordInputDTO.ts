import z from 'zod'

export const ForgotPasswordSchema = z.object({
	email: z.email(),
})

export type ForgotPasswordInputDTO = z.infer<typeof ForgotPasswordSchema>
