import type { RefreshToken } from '#domain/refreshToken/RefreshToken.js'

export interface RefreshTokenRepository {
	create(refreshToken: RefreshToken): Promise<void>
	revoke(tokenId: string): Promise<void>
	findByUserId(userId: string): Promise<RefreshToken | null>
	findByTokenId(tokenId: string): Promise<RefreshToken | null>
	deleteExpiredTokens(): Promise<void>
	revokeAllByUserId(userId: string): Promise<void>
}
