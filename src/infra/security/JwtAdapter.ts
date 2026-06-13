import jwt from 'jsonwebtoken'
import type { TokenPort } from '#application/ports/TokenPort.js'

class JwtAdapter implements TokenPort {
	public constructor(private jwtSecret: string) {}

	public generateToken(payload: Record<string, unknown>, expiredIn: number): string {
		return jwt.sign(payload, this.jwtSecret, { expiresIn: expiredIn })
	}

	public verifyToken<T>(token: string): T {
		const decoded = jwt.verify(token, this.jwtSecret)
		return decoded as T
	}
}

export default JwtAdapter
