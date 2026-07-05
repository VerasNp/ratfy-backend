import { vi } from 'vitest'
import type AuthMiddleware from '../AuthMiddleware'

export const authMiddlewareMock = {
	handle: vi.fn().mockImplementation(() => {
		return (req: any, _res: any, next: any) => {
			req.user = { userId: 'dummy-user-id' }
			next()
		}
	}),
} as unknown as AuthMiddleware
