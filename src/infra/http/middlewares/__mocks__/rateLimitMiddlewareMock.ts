import { vi } from 'vitest'
import type RateLimitMiddleware from '../RateLimitMiddleware'

export const rateLimiterMock = {
	handle: vi.fn().mockImplementation(() => {
		return (req: any, _res: any, next: any) => {
			next()
		}
	}),
} as unknown as RateLimitMiddleware
