import z from 'zod'

export const VerifyEmailSchema = z.object({
	token: z.string(),
})

export type VerifyEmailInputDTO = z.infer<typeof VerifyEmailSchema>
