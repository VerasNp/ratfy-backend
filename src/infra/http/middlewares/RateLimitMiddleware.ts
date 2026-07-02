import type { LoggerPort } from '#application/ports/LoggerPort.js'

interface RateLimitRecord {
	count: number
	resetTime: number
}

class RateLimitMiddleware {
	private store: Map<string, RateLimitRecord>

	public constructor(
		private loggerService: LoggerPort,
		private windowMs: number,
		private maxRequests: number,
	) {
		this.store = new Map()
		setInterval(() => this._cleanup(), this.windowMs)
	}

	public handle() {
		return (req: any, res: any, next: any) => {
			const key = req.ip
			const now = Date.now()
			const record = this.store.get(key)

			if (!record || now > record.resetTime) {
				this.store.set(key, { count: 1, resetTime: now + this.windowMs })
				return next()
			}

			if (record.count >= this.maxRequests) {
				this.loggerService.warn('Rate limit exceeded', {
					ip: key,
					route: req.originalUrl,
				})
				return res.status(429).json({
					message: 'Too many requests. Please try again later.',
				})
			}

			record.count++
			return next()
		}
	}

	private _cleanup(): void {
		const now = Date.now()
		for (const [key, record] of this.store.entries()) {
			if (now > record.resetTime) {
				this.store.delete(key)
			}
		}
	}
}

export default RateLimitMiddleware
