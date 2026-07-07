import z from 'zod'

export const RoleSchema = z.object({
	name: z.string({ message: 'Name is required' }),
	description: z.string().optional().nullable(),
})

export const CreateRoleSchema = RoleSchema
export const UpdateRoleSchema = RoleSchema
