import z from 'zod'

export const ResendVerificationEmailSchema = z.object({
	email: z.email(),
})

export type ResendVerificationEmailInputDTO = z.infer<typeof ResendVerificationEmailSchema>
