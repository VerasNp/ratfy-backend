import { z } from 'zod'

import { SignupSchema } from '../SignupInputDTO.js'

export const UserUpdateSchema = SignupSchema.partial().refine(
	(data) => Object.values(data).some((value) => value !== undefined),
	{ message: 'At least one field must be provided for update' },
)

export type UserUpdateInputDTO = z.infer<typeof UserUpdateSchema>
