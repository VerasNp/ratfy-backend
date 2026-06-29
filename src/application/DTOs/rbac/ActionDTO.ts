import z from 'zod'

export const ActionSchema = z.object({
	permissionId: z.string(),
	resourceId: z.string(),
})

export type ActionDTO = z.infer<typeof ActionSchema>
