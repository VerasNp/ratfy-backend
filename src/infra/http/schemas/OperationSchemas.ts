import z from 'zod'

export const OperationSchema = z.object({
	name: z.string({ message: 'Name is required' }),
	description: z.string().optional().nullable(),
})

export const CreateOperationSchema = OperationSchema
export const UpdateOperationSchema = OperationSchema
