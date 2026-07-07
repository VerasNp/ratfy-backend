import z from 'zod'

export const GrantPermissionToRoleSchema = z.object({
	permissionId: z.string({ message: 'Permission ID is required' }),
})
