import z from 'zod'

export const ResourceSchema = z.object({
	name: z.string({ message: 'Name is required' }),
})

export const CreateResourceSchema = ResourceSchema
export const UpdateResourceSchema = ResourceSchema
