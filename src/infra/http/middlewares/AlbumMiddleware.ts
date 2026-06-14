import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema, ZodError } from 'zod'

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(422).json({
        errors:  z.treeifyError(result.error),
        message: 'Validation failed',
      })
    }
    req.body = result.data
    next()
  }
