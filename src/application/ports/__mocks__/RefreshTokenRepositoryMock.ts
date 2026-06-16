import { vi } from 'vitest'
import type { RefreshTokenRepository } from '../RefreshTokenRepository'

export const refreshTokenRepositoryMock: RefreshTokenRepository = {
	create: vi.fn().mockResolvedValue(undefined),
	revoke: vi.fn().mockResolvedValue(undefined),
	findByUserId: vi.fn().mockResolvedValue(null),
	findByTokenId: vi.fn().mockResolvedValue(null),
	deleteExpiredTokens: vi.fn().mockResolvedValue(undefined),
	revokeAllByUserId: vi.fn().mockResolvedValue(undefined),
}
