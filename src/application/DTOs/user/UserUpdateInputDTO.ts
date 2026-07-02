import { z } from 'zod'

import { SignupSchema } from '../SignupInputDTO.js'

export const UserUpdateSchema = SignupSchema.partial().refine(
	(data) => Object.keys(data).length > 0,
	{ message: 'At least one field must be provided for update' },
)

export type UserUpdateInputDTO = z.infer<typeof UserUpdateSchema>
