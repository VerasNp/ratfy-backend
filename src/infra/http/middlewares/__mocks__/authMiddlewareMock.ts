import { vi } from 'vitest'
import type AuthMiddleware from '../AuthMiddleware'

export const createAuthMiddlewareMock = (userId: string = 'dummy-user-id'): AuthMiddleware => {
    return {
        handle: vi.fn().mockReturnValue((req: any, _res: any, next: any) => {
            req.user = { userId }
            next()
        }),
    } as unknown as AuthMiddleware
}

export const authMiddlewareMock = createAuthMiddlewareMock()
