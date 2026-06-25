import z from 'zod'

export const RoleSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	description: z.string().nullable().optional(),
	actions: z
		.array(
			z.object({
				resourceId: z.string(),
				permissionId: z.string(),
			}),
		)
		.optional(),
})

export type RoleDTO = z.infer<typeof RoleSchema>
