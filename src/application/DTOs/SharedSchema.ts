import { z } from 'zod'

export const ImageSchema = z.object({
  height: z.number().int().positive().nullable(),
  url:    z.url(),
  width:  z.number().int().positive().nullable(),
})
export const CopyrightSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['C', 'P']),
})
