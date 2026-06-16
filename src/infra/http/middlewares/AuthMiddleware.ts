import type { TokenPort } from '#application/ports/TokenPort.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import InvalidTokenError from '#application/errors/InvalidTokenError.js'

class AuthMiddleware {
	public constructor(
		private tokenService: TokenPort,
		private readonly loggerService: LoggerPort,
	) {}

	public handle() {
		return (req: any, res: any, next: any) => {
			try {
				const authHeader = req.headers.authorization
				if (!authHeader?.startsWith('Bearer ')) {
					this.loggerService.warn(
						'Unauthorized access attempt with missing or invalid Authorization header',
						{
							userAgent: req.headers['user-agent'] || 'unknown',
						},
					)
					return next(new InvalidTokenError())
				}
				const accessToken = authHeader.split(' ')[1]
				const payload = this.tokenService.verifyToken<{
					userId: string
					email: string
				}>(accessToken)
				req.user = {
					userId: payload.userId,
					email: payload.email,
				}
				req.user = { userId: payload.userId, email: payload.email }
				next()
			} catch (err) {
				return next(err)
			}
		}
	}
}

export default AuthMiddleware
