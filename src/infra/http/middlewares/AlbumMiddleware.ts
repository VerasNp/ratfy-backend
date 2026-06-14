import type { NextFunction, Request, Response, } from 'express'

import { z, type ZodType } from 'zod'

export const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      res.status(422).json({
        errors:  z.treeifyError(result.error),
        message: 'Validation failed',
      })
      return
    }

    req.body = result.data
    next()
  }
