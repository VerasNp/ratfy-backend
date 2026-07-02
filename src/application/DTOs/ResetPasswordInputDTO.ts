import z from 'zod'

export const ResetPasswordSchema = z.object({
	token: z.string(),
	newPassword: z.string(),
})

export type ResetPasswordInputDTO = z.infer<typeof ResetPasswordSchema>
