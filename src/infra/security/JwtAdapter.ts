import jwt from 'jsonwebtoken'
import type { TokenPort } from '#application/ports/TokenPort.js'
import type { LoggerPort } from '#application/ports/LoggerPort.js'
import ExpiredJWTError from './errors/ExpiredJWTError'

class JwtAdapter implements TokenPort {
	public constructor(
		private jwtSecret: string,
		private readonly loggerService: LoggerPort,
	) {}

	public generateToken(payload: Record<string, unknown>, expiredIn: number): string {
		return jwt.sign(payload, this.jwtSecret, { expiresIn: expiredIn })
	}

	public verifyToken<T>(token: string): T {
		try {
			const decoded = jwt.verify(token, this.jwtSecret)
			return decoded as T
		} catch (err) {
			this.loggerService.warn('JwtAdapter: Failed to verify token', { error: err })
			throw new ExpiredJWTError("Invalid or expired token")
		}
	}
}

export default JwtAdapter
