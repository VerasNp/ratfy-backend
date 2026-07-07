import z from 'zod'

export const PermissionSchema = z.object({
	operationId: z.string({ message: 'Operation ID is required' }),
	resourceId: z.string({ message: 'Resource ID is required' }),
})

export const CreatePermissionSchema = PermissionSchema
export const UpdatePermissionSchema = PermissionSchema
