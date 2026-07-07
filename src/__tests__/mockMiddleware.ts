import InvalidTokenError from '#application/errors/InvalidTokenError.js'

export const authMiddlewareMock: any = {
  handle: () => {
    return (req: any, _res: any, next: any) => {
      req.user = { userId: 'user-id' }
      next()
    }
  },
}

export const noAuthMiddlewareMock: any = {
  handle: () => {
    return (_req: any, _res: any, next: any) => {
      next(new InvalidTokenError())
    }
  },
}
